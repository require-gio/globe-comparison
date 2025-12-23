export interface Country {
  id: number;
  iso_code: string;
  name: string;
  official_name?: string;
  capital?: string;
  population?: string | number; // API returns string from BIGINT
  area_km2?: string | number; // API returns string from DECIMAL
  continent?: string;
  currency_code?: string;
  currency_name?: string;
  languages?: string[];
  flag_emoji?: string;
  created_at: string;
  updated_at: string;
}
