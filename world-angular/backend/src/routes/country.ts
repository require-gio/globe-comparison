import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CountriesData } from '../types/country.types';

const router = Router();

// Load countries data once at startup
let countriesData: CountriesData;
try {
  const dataPath = join(__dirname, '../data/countries.json');
  const data = readFileSync(dataPath, 'utf-8');
  countriesData = JSON.parse(data);
} catch (error) {
  console.error('Failed to load countries data:', error);
  countriesData = {};
}

/**
 * GET /api/country/:code
 * Retrieve country information by ISO 3166-1 alpha-2 country code
 * 
 * @param code - Two-letter country code (case-insensitive)
 * @returns Country data or error message
 */
router.get('/:code', (req: Request, res: Response) => {
  try {
    const code = req.params.code?.toUpperCase();

    // Validation: Check if code is valid format (2 uppercase letters)
    if (!code || !/^[A-Z]{2}$/.test(code)) {
      return res.status(400).json({
        message: 'Invalid country code format. Expected 2-letter ISO code (e.g., US, FR, JP)'
      });
    }

    // Lookup country by code
    const country = countriesData[code];

    // 404 if country not found
    if (!country) {
      return res.status(404).json({
        message: 'Information unavailable'
      });
    }

    // Success: return country data
    return res.status(200).json(country);

  } catch (error) {
    console.error('Error retrieving country data:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving country information'
    });
  }
});

export default router;
