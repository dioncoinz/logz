import type { AssetAction, AssetCategory, AssetStatus } from "@/types/database";

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Tool",
  "Equipment",
  "Vehicle",
  "Consumable",
  "Other",
];

export const ASSET_STATUSES: AssetStatus[] = ["IN", "OUT"];

export const ASSET_ACTIONS: AssetAction[] = ["IN", "OUT"];

export const DEFAULT_SCANNED_BY_NAME = "Site Scanner";

