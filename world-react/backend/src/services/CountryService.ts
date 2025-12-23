import { query } from '../db/connection.js';
import type { Country, CountryInput } from '../models/Country.js';

export class CountryService {
  async getCountryByIsoCode(isoCode: string): Promise<Country | null> {
    const result = await query(
      'SELECT * FROM countries WHERE iso_code = $1',
      [isoCode.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Country;
  }

  async getAllCountries(): Promise<Country[]> {
    const result = await query('SELECT * FROM countries ORDER BY name ASC');
    return result.rows as Country[];
  }

  async createCountry(country: CountryInput): Promise<Country> {
    const result = await query(
      `INSERT INTO countries (
        iso_code, name, official_name, capital, population,
        area_km2, continent, currency_code, currency_name,
        languages, flag_emoji
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        country.iso_code.toUpperCase(),
        country.name,
        country.official_name,
        country.capital,
        country.population,
        country.area_km2,
        country.continent,
        country.currency_code,
        country.currency_name,
        country.languages,
        country.flag_emoji,
      ]
    );

    return result.rows[0] as Country;
  }

  async updateCountry(isoCode: string, country: Partial<CountryInput>): Promise<Country | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(country).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.getCountryByIsoCode(isoCode);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(isoCode.toUpperCase());

    const result = await query(
      `UPDATE countries SET ${fields.join(', ')} WHERE iso_code = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Country;
  }

  async deleteCountry(isoCode: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM countries WHERE iso_code = $1 RETURNING id',
      [isoCode.toUpperCase()]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const countryService = new CountryService();
