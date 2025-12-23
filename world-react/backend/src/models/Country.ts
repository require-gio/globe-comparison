export interface Country {
  id: number;
  iso_code: string;
  name: string;
  official_name?: string;
  capital?: string;
  population?: number;
  area_km2?: number;
  continent?: string;
  currency_code?: string;
  currency_name?: string;
  languages?: string[];
  flag_emoji?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CountryInput {
  iso_code: string;
  name: string;
  official_name?: string;
  capital?: string;
  population?: number;
  area_km2?: number;
  continent?: string;
  currency_code?: string;
  currency_name?: string;
  languages?: string[];
  flag_emoji?: string;
}
