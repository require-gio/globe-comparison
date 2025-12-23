export interface Country {
  code: string;
  name: string;
  population: number;
  capital: string;
  region: string;
}

export type CountriesData = Record<string, Country>;
