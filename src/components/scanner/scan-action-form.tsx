"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type {
  Asset,
  AssetAction,
  AssetLog,
  ScanActionResponse,
  ScanDestination,
} from "@/types/database";

type ScanActionFormProps = {
  asset: Asset;
  destination: ScanDestination;
  initialOperatorName?: string;
  onAssetUpdated: (asset: Asset) => void;
  onScanAnother: () => void;
  onChangeDestination: () => void;
};

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ScanActionForm({
  asset,
  destination,
  initialOperatorName = "",
  onAssetUpdated,
  onScanAnother,
  onChangeDestination,
}: ScanActionFormProps) {
  const [operatorName, setOperatorName] = useState(initialOperatorName);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    asset: Asset;
    log: AssetLog;
  } | null>(null);

  const movement = useMemo(() => {
    if (destination.type === "person") {
      return {
        action: "OUT" as AssetAction,
        scannedById: destination.profile.id,
        scannedByName: destination.profile.full_name ?? "",
        locationId: null,
        heading: `Issue to ${destination.profile.full_name || "team member"}`,
        helper: `This tool will be checked OUT against ${destination.profile.full_name || "the scanned team member"}.`,
        buttonLabel: `Check OUT to ${destination.profile.full_name || "person"}`,
      };
    }

    return {
      action: "IN" as AssetAction,
      scannedById: null,
      scannedByName: operatorName.trim(),
      locationId: destination.location.id,
      heading: `Return to ${destination.location.name}`,
      helper: `This tool will be checked IN to ${destination.location.name}. Add the operator name for the audit trail.`,
      buttonLabel: `Check IN to ${destination.location.name}`,
    };
  }, [destination, operatorName]);

  async function submitAction() {
    if (isSaving) {
      return;
    }

    if (!movement.scannedByName) {
      setError(
        destination.type === "location"
          ? "Enter the operator name before saving this return."
          : "Scanned team member name is missing.",
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/scan/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset_id: asset.id,
          action: movement.action,
          scanned_by_name: movement.scannedByName,
          scanned_by: movement.scannedById,
          location_id: movement.locationId,
          note: note.trim() || null,
        }),
      });

      const payload = (await response.json()) as ScanActionResponse;

      if (!response.ok || !payload.ok) {
        setSuccess(null);
        setError(payload.ok ? "Unable to save scan action." : payload.error);
        return;
      }

      setSuccess({
        message: payload.message,
        asset: payload.asset,
        log: payload.log,
      });
      onAssetUpdated(payload.asset);
    } catch {
      setSuccess(null);
      setError("Save failed. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (success) {
    return (
      <div className="surface-panel rounded-3xl p-6 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-success">
          Movement Recorded
        </p>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {success.message}
        </h3>
        <p className="mt-3 text-sm leading-6 text-foreground/68">
          {success.asset.name} is now marked <StatusBadge status={success.asset.current_status} />.
        </p>
        <div className="mt-5 rounded-2xl border border-success/20 bg-success/8 px-4 py-4 text-sm leading-6 text-foreground/82">
          Logged by {success.log.scanned_by_name || "Unknown"} at {formatTimestamp(success.log.created_at)}.
          {success.log.location ? ` Location: ${success.log.location}.` : ""}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onScanAnother}
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-primary px-5 py-3 text-base font-semibold text-primary-foreground transition hover:opacity-95"
          >
            Scan another tool
          </button>
          <button
            type="button"
            onClick={onChangeDestination}
            className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-base font-semibold text-foreground transition hover:border-primary/45 hover:text-primary"
          >
            Scan a different destination
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-panel rounded-3xl p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-foreground/48">
            Confirm Movement
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {movement.heading}
          </h3>
          <p className="mt-3 text-sm leading-6 text-foreground/68">{movement.helper}</p>
        </div>
        <StatusBadge status={asset.current_status} />
      </div>

      <div className="mt-6 rounded-2xl border border-border/80 bg-surface/70 p-4 text-sm leading-6 text-foreground/76">
        {destination.type === "person" ? (
          <>
            Destination: <span className="font-semibold text-foreground">{destination.profile.full_name || "Team member"}</span>
            {destination.profile.role ? ` (${destination.profile.role})` : ""}
          </>
        ) : (
          <>
            Destination: <span className="font-semibold text-foreground">{destination.location.name}</span>
            {` (${destination.location.location_code})`}
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4">
        {destination.type === "location" ? (
          <label className="grid gap-2 text-sm font-medium text-foreground/80">
            Processed by name
            <input
              value={operatorName}
              onChange={(event) => setOperatorName(event.target.value)}
              placeholder="Storeperson or crew lead"
              className="min-h-14 rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-primary"
            />
          </label>
        ) : null}

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Optional movement note"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void submitAction()}
          className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-primary px-5 py-3 text-lg font-semibold text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isSaving ? "Saving..." : movement.buttonLabel}
        </button>
        <button
          type="button"
          onClick={onChangeDestination}
          className="inline-flex min-h-16 items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-lg font-semibold text-foreground transition hover:border-primary/45 hover:text-primary"
        >
          Change destination
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/8 px-4 py-3 text-sm leading-6 text-danger">
          {error}
        </div>
      ) : null}
    </div>
  );
}