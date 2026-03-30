const ASSET_CODE_PREFIX = "LOG";

export function formatAssetCode(sequenceNumber: number) {
  return `${ASSET_CODE_PREFIX}-${sequenceNumber.toString().padStart(4, "0")}`;
}

export function parseAssetCode(assetCode: string) {
  const parts = assetCode.split("-");
  const numericPart = Number(parts.at(-1));

  return Number.isFinite(numericPart) ? numericPart : 0;
}

