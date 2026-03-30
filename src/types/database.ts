export type AssetCategory =
  | "Tool"
  | "Equipment"
  | "Vehicle"
  | "Consumable"
  | "Other";

export type AssetStatus = "IN" | "OUT";

export type AssetAction = "IN" | "OUT";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: string | null;
          qr_value: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: string | null;
          qr_value?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: string | null;
          qr_value?: string | null;
          created_at?: string;
        };
      };
      store_locations: {
        Row: {
          id: string;
          location_code: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_code: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_code?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          asset_code: string;
          name: string;
          category: AssetCategory;
          description: string | null;
          purchase_date: string | null;
          cost: number | null;
          current_status: AssetStatus;
          current_holder: string | null;
          current_location: string | null;
          location_id: string | null;
          qr_value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_code: string;
          name: string;
          category: AssetCategory;
          description?: string | null;
          purchase_date?: string | null;
          cost?: number | null;
          current_status?: AssetStatus;
          current_holder?: string | null;
          current_location?: string | null;
          location_id?: string | null;
          qr_value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_code?: string;
          name?: string;
          category?: AssetCategory;
          description?: string | null;
          purchase_date?: string | null;
          cost?: number | null;
          current_status?: AssetStatus;
          current_holder?: string | null;
          current_location?: string | null;
          location_id?: string | null;
          qr_value?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      asset_logs: {
        Row: {
          id: string;
          asset_id: string;
          action: AssetAction;
          scanned_by: string | null;
          scanned_by_name: string | null;
          note: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          action: AssetAction;
          scanned_by?: string | null;
          scanned_by_name?: string | null;
          note?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          action?: AssetAction;
          scanned_by?: string | null;
          scanned_by_name?: string | null;
          note?: string | null;
          location?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type StoreLocation = Database["public"]["Tables"]["store_locations"]["Row"];
export type StoreLocationInsert = Database["public"]["Tables"]["store_locations"]["Insert"];
export type StoreLocationUpdate = Database["public"]["Tables"]["store_locations"]["Update"];
export type Asset = Database["public"]["Tables"]["assets"]["Row"];
export type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"];
export type AssetUpdate = Database["public"]["Tables"]["assets"]["Update"];
export type AssetLog = Database["public"]["Tables"]["asset_logs"]["Row"];
export type AssetLogInsert = Database["public"]["Tables"]["asset_logs"]["Insert"];
export type AssetLogUpdate = Database["public"]["Tables"]["asset_logs"]["Update"];

export type ScanLookupRequest = {
  qr_value: string;
};

export type ScanLookupSuccessResponse = {
  ok: true;
  asset: Asset;
};

export type ScanLookupErrorResponse = {
  ok: false;
  error: string;
};

export type ScanLookupResponse =
  | ScanLookupSuccessResponse
  | ScanLookupErrorResponse;

export type ScanActionRequest = {
  asset_id: string;
  action: AssetAction;
  scanned_by_name: string;
  scanned_by?: string | null;
  location?: string | null;
  location_id?: string | null;
  note?: string | null;
};

export type ScanActionSuccessResponse = {
  ok: true;
  message: string;
  asset: Asset;
  log: AssetLog;
};

export type ScanActionErrorResponse = {
  ok: false;
  error: string;
};

export type ScanActionResponse =
  | ScanActionSuccessResponse
  | ScanActionErrorResponse;

export type ProfileLookupRequest = {
  qr_value: string;
};

export type ProfileLookupSuccessResponse = {
  ok: true;
  profile: Profile;
};

export type ProfileLookupErrorResponse = {
  ok: false;
  error: string;
};

export type ProfileLookupResponse =
  | ProfileLookupSuccessResponse
  | ProfileLookupErrorResponse;

export type ScanDestination =
  | {
      type: "person";
      profile: Profile;
    }
  | {
      type: "location";
      location: StoreLocation;
    };

export type ScanDestinationLookupRequest = {
  qr_value: string;
};

export type ScanDestinationLookupSuccessResponse = {
  ok: true;
  destination: ScanDestination;
};

export type ScanDestinationLookupErrorResponse = {
  ok: false;
  error: string;
};

export type ScanDestinationLookupResponse =
  | ScanDestinationLookupSuccessResponse
  | ScanDestinationLookupErrorResponse;

export type AssetQrLabelData = Pick<
  Asset,
  "id" | "name" | "asset_code" | "qr_value" | "category" | "current_status"
>;

export type ProfileQrLabelData = Pick<
  Profile,
  "id" | "full_name" | "role" | "qr_value"
>;

export type LocationSummary = StoreLocation & {
  asset_count: number;
  assets_in: number;
  assets_out: number;
};

export type TeamMemberSummary = Profile & {
  assets_out_count: number;
};