"use client";

import { useMemo, useRef, useState } from "react";
import { QrScanner } from "@/components/scanner/qr-scanner";
import { ScanActionForm } from "@/components/scanner/scan-action-form";
import { ScanResultCard } from "@/components/scanner/scan-result-card";
import { hasSupabaseConfig } from "@/lib/supabase/client";
import type {
  Asset,
  ScanActionResponse,
  ScanDestination,
  ScanDestinationLookupResponse,
  ScanLookupResponse,
} from "@/types/database";

type LookupState = "idle" | "loading" | "not-found" | "error" | "ready";

type ProcessedState = {
  assetName: string;
  assetCode: string;
  message: string;
};

export function ScanResultPanel() {
  const [destinationQrValue, setDestinationQrValue] = useState("");
  const [assetQrValue, setAssetQrValue] = useState("");
  const [destination, setDestination] = useState<ScanDestination | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [continuousMode, setContinuousMode] = useState(true);
  const [locationOperatorName, setLocationOperatorName] = useState("");
  const [destinationLookupState, setDestinationLookupState] = useState<LookupState>("idle");
  const [assetLookupState, setAssetLookupState] = useState<LookupState>("idle");
  const [destinationMessage, setDestinationMessage] = useState(
    "Scan the destination first, like a team member QR or a store location QR.",
  );
  const [assetMessage, setAssetMessage] = useState(
    "Once the destination is loaded, scan the tool QR next.",
  );
  const [processedState, setProcessedState] = useState<ProcessedState | null>(null);
  const [destinationScannerKey, setDestinationScannerKey] = useState(0);
  const [assetScannerKey, setAssetScannerKey] = useState(0);
  const destinationLookupInFlightRef = useRef(false);
  const assetLookupInFlightRef = useRef(false);
  const autoSubmitInFlightRef = useRef(false);

  const canUseContinuousMode = useMemo(() => {
    if (!destination) {
      return false;
    }

    if (destination.type === "person") {
      return Boolean(destination.profile.full_name);
    }

    return Boolean(locationOperatorName.trim());
  }, [destination, locationOperatorName]);

  async function processAssetMovement(scannedAsset: Asset) {
    if (!destination || autoSubmitInFlightRef.current) {
      return false;
    }

    const payload =
      destination.type === "person"
        ? {
            asset_id: scannedAsset.id,
            action: "OUT",
            scanned_by_name: destination.profile.full_name ?? "",
            scanned_by: destination.profile.id,
            location_id: null,
            note: null,
          }
        : {
            asset_id: scannedAsset.id,
            action: "IN",
            scanned_by_name: locationOperatorName.trim(),
            scanned_by: null,
            location_id: destination.location.id,
            note: null,
          };

    if (!payload.scanned_by_name) {
      return false;
    }

    autoSubmitInFlightRef.current = true;
    setAssetMessage(`Saving ${scannedAsset.name}...`);

    try {
      const response = await fetch("/api/scan/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as ScanActionResponse;

      if (!response.ok || !result.ok) {
        setAsset(scannedAsset);
        setAssetLookupState("ready");
        setAssetMessage(
          result.ok
            ? "Auto-processing failed. Review and confirm manually below."
            : `${result.error} Review and confirm manually below.`,
        );
        return false;
      }

      setProcessedState({
        assetName: result.asset.name,
        assetCode: result.asset.asset_code,
        message: result.message,
      });
      setAsset(null);
      setAssetQrValue("");
      setAssetLookupState("idle");
      setAssetMessage("Tool processed. Scan the next tool for this same destination.");
      setAssetScannerKey((value) => value + 1);
      return true;
    } catch {
      setAsset(scannedAsset);
      setAssetLookupState("ready");
      setAssetMessage("Auto-processing failed. Review and confirm manually below.");
      return false;
    } finally {
      autoSubmitInFlightRef.current = false;
    }
  }

  async function lookupDestination(rawValue: string) {
    const qrValue = rawValue.trim();

    if (!qrValue || destinationLookupInFlightRef.current) {
      if (!qrValue) {
        setDestinationLookupState("error");
        setDestinationMessage("Enter a team QR value or location code before searching.");
      }
      return;
    }

    destinationLookupInFlightRef.current = true;
    setDestinationQrValue(qrValue);
    setDestinationLookupState("loading");
    setDestinationMessage("Looking up destination...");
    setDestination(null);
    setAsset(null);
    setProcessedState(null);
    setLocationOperatorName("");
    setAssetLookupState("idle");
    setAssetMessage("Once the destination is loaded, scan the tool QR next.");

    try {
      const response = await fetch("/api/scan/destination/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qr_value: qrValue }),
      });

      const payload = (await response.json()) as ScanDestinationLookupResponse;

      if (!response.ok || !payload.ok) {
        setDestinationLookupState(response.status === 404 ? "not-found" : "error");
        setDestinationMessage(payload.ok ? "Destination lookup failed." : payload.error);
        setDestination(null);
        return;
      }

      setDestination(payload.destination);
      setDestinationLookupState("ready");
      setDestinationMessage(
        payload.destination.type === "person"
          ? `${payload.destination.profile.full_name || "Team member"} loaded. Scan tools to issue next.`
          : `${payload.destination.location.name} loaded. Add the operator name if you want continuous returns.`,
      );
    } catch {
      setDestinationLookupState("error");
      setDestinationMessage("Destination lookup failed. Check your connection and try again.");
      setDestination(null);
    } finally {
      destinationLookupInFlightRef.current = false;
    }
  }

  async function lookupAsset(rawValue: string) {
    const qrValue = rawValue.trim();

    if (!qrValue || assetLookupInFlightRef.current || autoSubmitInFlightRef.current) {
      if (!qrValue) {
        setAssetLookupState("error");
        setAssetMessage("Enter a tool QR value before searching.");
      }
      return;
    }

    if (!destination) {
      setAssetLookupState("error");
      setAssetMessage("Scan the destination first, then scan the tool.");
      return;
    }

    assetLookupInFlightRef.current = true;
    setAssetQrValue(qrValue);
    setAssetLookupState("loading");
    setAssetMessage("Looking up tool record...");
    setAsset(null);

    try {
      const response = await fetch("/api/scan/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qr_value: qrValue }),
      });

      const payload = (await response.json()) as ScanLookupResponse;

      if (!response.ok || !payload.ok) {
        setAssetLookupState(response.status === 404 ? "not-found" : "error");
        setAssetMessage(payload.ok ? "Asset lookup failed." : payload.error);
        setAsset(null);
        return;
      }

      if (continuousMode && canUseContinuousMode) {
        await processAssetMovement(payload.asset);
        return;
      }

      setAsset(payload.asset);
      setAssetLookupState("ready");
      setAssetMessage(`${payload.asset.name} loaded. Confirm the movement below.`);
    } catch {
      setAssetLookupState("error");
      setAssetMessage("Tool lookup failed. Check your connection and try again.");
      setAsset(null);
    } finally {
      assetLookupInFlightRef.current = false;
    }
  }

  function resetDestination() {
    setDestination(null);
    setDestinationQrValue("");
    setDestinationLookupState("idle");
    setDestinationMessage("Scan the destination first, like a team member QR or a store location QR.");
    setAsset(null);
    setAssetQrValue("");
    setProcessedState(null);
    setLocationOperatorName("");
    setAssetLookupState("idle");
    setAssetMessage("Once the destination is loaded, scan the tool QR next.");
    setDestinationScannerKey((value) => value + 1);
    setAssetScannerKey((value) => value + 1);
  }

  function resetAssetOnly() {
    setAsset(null);
    setAssetQrValue("");
    setProcessedState(null);
    setAssetLookupState("idle");
    setAssetMessage("Ready for the next tool scan against this destination.");
    setAssetScannerKey((value) => value + 1);
  }

  if (!hasSupabaseConfig()) {
    return (
      <div className="surface-panel rounded-3xl p-6">
        <p className="text-sm leading-6 text-foreground/72">
          Configure Supabase first to enable QR lookups and scan logging.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.92fr,1.08fr]">
      <div className="grid gap-4 self-start">
        <div className="surface-panel rounded-3xl p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-foreground/48">
                Step 1
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Scan destination
              </h2>
            </div>
            <button
              type="button"
              onClick={resetDestination}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:text-primary"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <QrScanner
              key={destinationScannerKey}
              paused={Boolean(destination) || destinationLookupState === "loading"}
              onDetected={lookupDestination}
              title="Destination QR"
              compact
            />

            <label className="grid gap-2 text-sm font-medium text-foreground/80">
              Manual destination entry
              <input
                value={destinationQrValue}
                onChange={(event) => setDestinationQrValue(event.target.value)}
                placeholder="Team QR value or location code"
                className="min-h-12 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </label>

            {destination?.type === "location" ? (
              <label className="grid gap-2 text-sm font-medium text-foreground/80">
                Operator name
                <input
                  value={locationOperatorName}
                  onChange={(event) => setLocationOperatorName(event.target.value)}
                  placeholder="Storeperson or crew lead"
                  className="min-h-12 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>
            ) : null}

            <div className="rounded-2xl border border-border/80 bg-surface/70 px-4 py-3 text-sm leading-6 text-foreground/76">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">Continuous mode</p>
                  <p className="mt-1 text-foreground/65">
                    Auto-process each tool scan against the current destination.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setContinuousMode((value) => !value)}
                  className={`inline-flex min-h-9 items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    continuousMode
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-white text-foreground hover:border-primary/45 hover:text-primary"
                  }`}
                >
                  {continuousMode ? "On" : "Off"}
                </button>
              </div>
              {continuousMode && destination && !canUseContinuousMode ? (
                <p className="mt-2 text-danger">
                  {destination.type === "location"
                    ? "Add the operator name to use continuous returns."
                    : "This person QR needs a name before continuous issue can run."}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => lookupDestination(destinationQrValue)}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sidebar px-4 py-3 text-sm font-semibold text-sidebar-foreground transition hover:bg-sidebar/92"
            >
              Find destination
            </button>

            <div
              className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                destinationLookupState === "error" || destinationLookupState === "not-found"
                  ? "bg-danger/8 text-danger"
                  : destinationLookupState === "ready"
                    ? "bg-success/8 text-success"
                    : "bg-surface text-foreground/70"
              }`}
            >
              {destinationMessage}
            </div>
          </div>
        </div>

        <div className="surface-panel rounded-3xl p-4 sm:p-5">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-foreground/48">
            Step 2
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Scan tool
          </h2>

          {destination ? (
            <p className="mt-2 text-sm leading-6 text-foreground/68">
              Destination:{" "}
              <span className="font-semibold text-foreground">
                {destination.type === "person"
                  ? destination.profile.full_name || "Team member"
                  : destination.location.name}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-foreground/68">
              Tool scan stays locked until a destination is loaded.
            </p>
          )}

          <div className="mt-4 grid gap-3">
            <QrScanner
              key={assetScannerKey}
              paused={!destination || (!continuousMode && Boolean(asset)) || assetLookupState === "loading" || autoSubmitInFlightRef.current}
              onDetected={lookupAsset}
              title="Tool QR"
              compact
            />

            <label className="grid gap-2 text-sm font-medium text-foreground/80">
              Manual tool entry
              <input
                value={assetQrValue}
                onChange={(event) => setAssetQrValue(event.target.value)}
                placeholder="Tool QR value"
                className="min-h-12 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => lookupAsset(assetQrValue)}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sidebar px-4 py-3 text-sm font-semibold text-sidebar-foreground transition hover:bg-sidebar/92 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!destination || autoSubmitInFlightRef.current}
              >
                Find tool
              </button>
              <button
                type="button"
                onClick={resetAssetOnly}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:text-primary"
              >
                Next tool
              </button>
            </div>

            <div
              className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                assetLookupState === "error" || assetLookupState === "not-found"
                  ? "bg-danger/8 text-danger"
                  : assetLookupState === "ready"
                    ? "bg-success/8 text-success"
                    : "bg-surface text-foreground/70"
              }`}
            >
              {assetMessage}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 self-start">
        {asset && destination ? (
          <>
            <ScanResultCard asset={asset} />
            <ScanActionForm
              asset={asset}
              destination={destination}
              initialOperatorName={locationOperatorName}
              onAssetUpdated={(updatedAsset) => setAsset(updatedAsset)}
              onScanAnother={resetAssetOnly}
              onChangeDestination={resetDestination}
            />
          </>
        ) : (
          <div className="surface-panel grid min-h-[18rem] place-items-center rounded-3xl p-6 text-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-foreground/46">
                {processedState ? "Last Processed" : "Awaiting Tool"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {processedState
                  ? processedState.assetName
                  : !destination
                    ? "Scan the destination first"
                    : assetLookupState === "not-found"
                      ? "No tool matched that QR code"
                      : assetLookupState === "loading"
                        ? "Looking up tool"
                        : "Scan the tool to continue"}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-foreground/68">
                {processedState
                  ? `${processedState.assetCode} processed successfully. Keep scanning tools for this same destination, or change destination when you are done.`
                  : !destination
                    ? "Start with the person or storage location the tool is going to, then scan the tool itself."
                    : assetLookupState === "not-found"
                      ? "Check the sticker, try manual entry, or register the asset before scanning again."
                      : assetLookupState === "error"
                        ? "The tool lookup failed. Restart the scanner or use manual entry below."
                        : "Once a tool is found, you can confirm the movement against the scanned destination here."}
              </p>
              {processedState ? (
                <div className="mt-4 rounded-xl bg-success/8 px-4 py-3 text-sm leading-6 text-success">
                  {processedState.message}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}