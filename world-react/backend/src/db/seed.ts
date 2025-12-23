import { countryService } from '../services/CountryService.js';
import { closePool } from './connection.js';
import type { CountryInput } from '../models/Country.js';

const sampleCountries: CountryInput[] = [
  {
    iso_code: 'USA',
    name: 'United States',
    official_name: 'United States of America',
    capital: 'Washington, D.C.',
    population: 331900000,
    area_km2: 9833520,
    continent: 'North America',
    currency_code: 'USD',
    currency_name: 'United States Dollar',
    languages: ['English'],
    flag_emoji: '🇺🇸',
  },
  {
    iso_code: 'FRA',
    name: 'France',
    official_name: 'French Republic',
    capital: 'Paris',
    population: 67390000,
    area_km2: 643801,
    continent: 'Europe',
    currency_code: 'EUR',
    currency_name: 'Euro',
    languages: ['French'],
    flag_emoji: '🇫🇷',
  },
  {
    iso_code: 'JPN',
    name: 'Japan',
    official_name: 'Japan',
    capital: 'Tokyo',
    population: 125800000,
    area_km2: 377975,
    continent: 'Asia',
    currency_code: 'JPY',
    currency_name: 'Japanese Yen',
    languages: ['Japanese'],
    flag_emoji: '🇯🇵',
  },
  {
    iso_code: 'DEU',
    name: 'Germany',
    official_name: 'Federal Republic of Germany',
    capital: 'Berlin',
    population: 83240000,
    area_km2: 357114,
    continent: 'Europe',
    currency_code: 'EUR',
    currency_name: 'Euro',
    languages: ['German'],
    flag_emoji: '🇩🇪',
  },
  {
    iso_code: 'GBR',
    name: 'United Kingdom',
    official_name: 'United Kingdom of Great Britain and Northern Ireland',
    capital: 'London',
    population: 67220000,
    area_km2: 242495,
    continent: 'Europe',
    currency_code: 'GBP',
    currency_name: 'Pound Sterling',
    languages: ['English'],
    flag_emoji: '🇬🇧',
  },
  {
    iso_code: 'CAN',
    name: 'Canada',
    official_name: 'Canada',
    capital: 'Ottawa',
    population: 38010000,
    area_km2: 9984670,
    continent: 'North America',
    currency_code: 'CAD',
    currency_name: 'Canadian Dollar',
    languages: ['English', 'French'],
    flag_emoji: '🇨🇦',
  },
  {
    iso_code: 'AUS',
    name: 'Australia',
    official_name: 'Commonwealth of Australia',
    capital: 'Canberra',
    population: 25690000,
    area_km2: 7692024,
    continent: 'Oceania',
    currency_code: 'AUD',
    currency_name: 'Australian Dollar',
    languages: ['English'],
    flag_emoji: '🇦🇺',
  },
  {
    iso_code: 'BRA',
    name: 'Brazil',
    official_name: 'Federative Republic of Brazil',
    capital: 'Brasília',
    population: 212600000,
    area_km2: 8515767,
    continent: 'South America',
    currency_code: 'BRL',
    currency_name: 'Brazilian Real',
    languages: ['Portuguese'],
    flag_emoji: '🇧🇷',
  },
  {
    iso_code: 'CHN',
    name: 'China',
    official_name: "People's Republic of China",
    capital: 'Beijing',
    population: 1412000000,
    area_km2: 9596961,
    continent: 'Asia',
    currency_code: 'CNY',
    currency_name: 'Chinese Yuan',
    languages: ['Mandarin Chinese'],
    flag_emoji: '🇨🇳',
  },
  {
    iso_code: 'IND',
    name: 'India',
    official_name: 'Republic of India',
    capital: 'New Delhi',
    population: 1380000000,
    area_km2: 3287263,
    continent: 'Asia',
    currency_code: 'INR',
    currency_name: 'Indian Rupee',
    languages: ['Hindi', 'English'],
    flag_emoji: '🇮🇳',
  },
  {
    iso_code: 'RUS',
    name: 'Russia',
    official_name: 'Russian Federation',
    capital: 'Moscow',
    population: 145900000,
    area_km2: 17098246,
    continent: 'Europe',
    currency_code: 'RUB',
    currency_name: 'Russian Ruble',
    languages: ['Russian'],
    flag_emoji: '🇷🇺',
  },
  {
    iso_code: 'MEX',
    name: 'Mexico',
    official_name: 'United Mexican States',
    capital: 'Mexico City',
    population: 128900000,
    area_km2: 1964375,
    continent: 'North America',
    currency_code: 'MXN',
    currency_name: 'Mexican Peso',
    languages: ['Spanish'],
    flag_emoji: '🇲🇽',
  },
  {
    iso_code: 'ESP',
    name: 'Spain',
    official_name: 'Kingdom of Spain',
    capital: 'Madrid',
    population: 47350000,
    area_km2: 505990,
    continent: 'Europe',
    currency_code: 'EUR',
    currency_name: 'Euro',
    languages: ['Spanish'],
    flag_emoji: '🇪🇸',
  },
  {
    iso_code: 'ITA',
    name: 'Italy',
    official_name: 'Italian Republic',
    capital: 'Rome',
    population: 59550000,
    area_km2: 301340,
    continent: 'Europe',
    currency_code: 'EUR',
    currency_name: 'Euro',
    languages: ['Italian'],
    flag_emoji: '🇮🇹',
  },
  {
    iso_code: 'ZAF',
    name: 'South Africa',
    official_name: 'Republic of South Africa',
    capital: 'Pretoria',
    population: 59310000,
    area_km2: 1221037,
    continent: 'Africa',
    currency_code: 'ZAR',
    currency_name: 'South African Rand',
    languages: ['Afrikaans', 'English', 'Zulu', 'Xhosa'],
    flag_emoji: '🇿🇦',
  },
  {
    iso_code: 'EGY',
    name: 'Egypt',
    official_name: 'Arab Republic of Egypt',
    capital: 'Cairo',
    population: 102300000,
    area_km2: 1002450,
    continent: 'Africa',
    currency_code: 'EGP',
    currency_name: 'Egyptian Pound',
    languages: ['Arabic'],
    flag_emoji: '🇪🇬',
  },
  {
    iso_code: 'ARG',
    name: 'Argentina',
    official_name: 'Argentine Republic',
    capital: 'Buenos Aires',
    population: 45380000,
    area_km2: 2780400,
    continent: 'South America',
    currency_code: 'ARS',
    currency_name: 'Argentine Peso',
    languages: ['Spanish'],
    flag_emoji: '🇦🇷',
  },
  {
    iso_code: 'KOR',
    name: 'South Korea',
    official_name: 'Republic of Korea',
    capital: 'Seoul',
    population: 51780000,
    area_km2: 100210,
    continent: 'Asia',
    currency_code: 'KRW',
    currency_name: 'South Korean Won',
    languages: ['Korean'],
    flag_emoji: '🇰🇷',
  },
  {
    iso_code: 'NGA',
    name: 'Nigeria',
    official_name: 'Federal Republic of Nigeria',
    capital: 'Abuja',
    population: 206100000,
    area_km2: 923768,
    continent: 'Africa',
    currency_code: 'NGN',
    currency_name: 'Nigerian Naira',
    languages: ['English'],
    flag_emoji: '🇳🇬',
  },
  {
    iso_code: 'TUR',
    name: 'Turkey',
    official_name: 'Republic of Turkey',
    capital: 'Ankara',
    population: 84340000,
    area_km2: 783562,
    continent: 'Asia',
    currency_code: 'TRY',
    currency_name: 'Turkish Lira',
    languages: ['Turkish'],
    flag_emoji: '🇹🇷',
  },
];

async function seed(): Promise<void> {
  try {
    console.log('Starting database seeding...');

    for (const country of sampleCountries) {
      try {
        await countryService.createCountry(country);
        console.log(`✓ Inserted ${country.name} (${country.iso_code})`);
      } catch (error) {
        // Skip if already exists
        if (error instanceof Error && error.message.includes('duplicate key')) {
          console.log(`- Skipped ${country.name} (already exists)`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✓ Database seeding completed successfully!');
    console.log(`Total countries inserted: ${sampleCountries.length}`);
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed process failed:', error);
      process.exit(1);
    });
}
