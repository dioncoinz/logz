import QRCode from "qrcode";
import type { AssetQrLabelData, ProfileQrLabelData } from "@/types/database";

type QrRenderOptions = {
  width?: number;
  margin?: number;
};

const DEFAULT_QR_OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 1,
  width: 720,
  color: {
    dark: "#10202b",
    light: "#ffffff",
  },
};

function sanitizeForFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "logz-qr";
}

export function generateQrValue() {
  return `logz:${crypto.randomUUID()}`;
}

export function generateProfileQrValue(profileId: string) {
  return `logz:person:${profileId}`;
}

export function getQrDownloadFilename(identifier: string) {
  return `${sanitizeForFilename(identifier)}-qr.png`;
}

export function getQrPrintFilename(identifier: string) {
  return `${sanitizeForFilename(identifier)}-label`;
}

export async function createQrDataUrl(
  value: string,
  options: QrRenderOptions = {},
) {
  return QRCode.toDataURL(value, {
    ...DEFAULT_QR_OPTIONS,
    ...options,
  });
}

export async function createQrSvgString(
  value: string,
  options: QrRenderOptions = {},
) {
  return QRCode.toString(value, {
    ...DEFAULT_QR_OPTIONS,
    ...options,
    type: "svg",
  });
}

export async function createAssetQrLabel(
  asset: AssetQrLabelData,
  options: QrRenderOptions = {},
) {
  return {
    asset,
    qrDataUrl: await createQrDataUrl(asset.qr_value, options),
  };
}

export async function createAssetQrLabels(
  assets: AssetQrLabelData[],
  options: QrRenderOptions = {},
) {
  return Promise.all(assets.map((asset) => createAssetQrLabel(asset, options)));
}

export async function createProfileQrLabel(
  profile: ProfileQrLabelData,
  options: QrRenderOptions = {},
) {
  if (!profile.qr_value) {
    throw new Error("This team member does not have a QR value yet.");
  }

  return {
    profile,
    qrDataUrl: await createQrDataUrl(profile.qr_value, options),
  };
}