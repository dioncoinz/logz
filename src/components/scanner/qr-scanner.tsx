"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";

type QrScannerProps = {
  onDetected: (value: string) => void;
  paused?: boolean;
  title?: string;
  className?: string;
  compact?: boolean;
};

function getCameraErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to access the camera on this device.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("permission") || message.includes("denied")) {
    return "Camera permission was denied. Allow access or use manual QR entry below.";
  }

  if (message.includes("notfound") || message.includes("camera") || message.includes("device")) {
    return "No usable camera was found. Use manual QR entry below.";
  }

  return error.message;
}

export function QrScanner({
  onDetected,
  paused = false,
  title = "Aim at the QR tag",
  className,
  compact = false,
}: QrScannerProps) {
  const elementId = useId().replace(/:/g, "");
  const [status, setStatus] = useState("Starting camera...");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [restartToken, setRestartToken] = useState(0);
  const scannerRef = useRef<InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null>(null);
  const duplicateGuardRef = useRef<string | null>(null);
  const detectedRef = useRef(false);
  const handleDetected = useEffectEvent((value: string) => {
    onDetected(value);
  });

  useEffect(() => {
    let active = true;

    async function stopScanner() {
      const scanner = scannerRef.current;

      if (!scanner) {
        return;
      }

      scannerRef.current = null;

      try {
        await scanner.stop();
      } catch {
        // Scanner may already be stopped.
      }

      try {
        await scanner.clear();
      } catch {
        // Ignore cleanup errors from disposed scanner instances.
      }

      if (active) {
        setIsRunning(false);
      }
    }

    async function startScanner() {
      if (paused) {
        setIsStarting(false);
        setIsRunning(false);
        setStatus("Scanner paused.");
        await stopScanner();
        return;
      }

      setIsStarting(true);
      setError(null);
      setStatus("Initializing camera...");
      detectedRef.current = false;
      duplicateGuardRef.current = null;

      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

        if (!active) {
          return;
        }

        const cameras = await Html5Qrcode.getCameras();

        if (!active) {
          return;
        }

        if (!cameras.length) {
          throw new Error("No camera devices detected.");
        }

        const scanner = new Html5Qrcode(elementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });

        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: compact ? { width: 180, height: 180 } : { width: 220, height: 220 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            const value = decodedText.trim();

            if (!value || detectedRef.current || duplicateGuardRef.current === value) {
              return;
            }

            detectedRef.current = true;
            duplicateGuardRef.current = value;
            setStatus("QR code captured.");
            await stopScanner();
            handleDetected(value);
          },
          () => undefined,
        );

        if (!active) {
          await stopScanner();
          return;
        }

        setIsRunning(true);
        setStatus("Camera ready. Hold the QR inside the frame.");
      } catch (scannerError) {
        await stopScanner();

        if (!active) {
          return;
        }

        setError(getCameraErrorMessage(scannerError));
        setStatus("Camera unavailable.");
      } finally {
        if (active) {
          setIsStarting(false);
        }
      }
    }

    void startScanner();

    return () => {
      active = false;
      void stopScanner();
    };
  }, [compact, elementId, paused, restartToken]);

  return (
    <div className={className ?? ""}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/48">
            Live Camera Scan
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setRestartToken((value) => value + 1)}
          className="inline-flex min-h-10 items-center rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:text-primary"
        >
          Restart
        </button>
      </div>

      <div
        id={elementId}
        className={`mt-4 overflow-hidden rounded-[1.5rem] border border-border/70 bg-black/90 [&>video]:h-full [&>video]:w-full [&>video]:object-cover ${compact ? "aspect-[4/3] max-h-[15rem]" : "aspect-square max-h-[22rem]"}`}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground/72">
        <span className="inline-flex rounded-full bg-surface px-3 py-1 font-medium">
          {isStarting ? "Starting" : isRunning ? "Scanning" : "Idle"}
        </span>
        <p>{status}</p>
      </div>

      {error ? (
        <div className="mt-3 rounded-2xl border border-danger/20 bg-danger/8 px-4 py-3 text-sm leading-6 text-danger">
          {error}
        </div>
      ) : null}
    </div>
  );
}