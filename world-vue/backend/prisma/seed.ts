import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample country data - in production, this would come from a comprehensive dataset
const countries = [
  {
    id: 'USA',
    name: 'United States of America',
    capital: 'Washington, D.C.',
    population: 331002651n,
    region: 'Americas',
    subregion: 'Northern America',
    area: 9833517.0,
    currency: 'USD',
    languages: ['eng'],
    flag: '🇺🇸',
    lat: 37.0902,
    lng: -95.7129,
    timezone: 'UTC-5',
  },
  {
    id: 'CAN',
    name: 'Canada',
    capital: 'Ottawa',
    population: 37742154n,
    region: 'Americas',
    subregion: 'Northern America',
    area: 9984670.0,
    currency: 'CAD',
    languages: ['eng', 'fra'],
    flag: '🇨🇦',
    lat: 56.1304,
    lng: -106.3468,
    timezone: 'UTC-5',
  },
  {
    id: 'FRA',
    name: 'France',
    capital: 'Paris',
    population: 67391582n,
    region: 'Europe',
    subregion: 'Western Europe',
    area: 643801.0,
    currency: 'EUR',
    languages: ['fra'],
    flag: '🇫🇷',
    lat: 46.2276,
    lng: 2.2137,
    timezone: 'UTC+1',
  },
  {
    id: 'DEU',
    name: 'Germany',
    capital: 'Berlin',
    population: 83783942n,
    region: 'Europe',
    subregion: 'Western Europe',
    area: 357114.0,
    currency: 'EUR',
    languages: ['deu'],
    flag: '🇩🇪',
    lat: 51.1657,
    lng: 10.4515,
    timezone: 'UTC+1',
  },
  {
    id: 'GBR',
    name: 'United Kingdom',
    capital: 'London',
    population: 67886011n,
    region: 'Europe',
    subregion: 'Northern Europe',
    area: 242900.0,
    currency: 'GBP',
    languages: ['eng'],
    flag: '🇬🇧',
    lat: 55.3781,
    lng: -3.4360,
    timezone: 'UTC+0',
  },
  {
    id: 'JPN',
    name: 'Japan',
    capital: 'Tokyo',
    population: 126476461n,
    region: 'Asia',
    subregion: 'Eastern Asia',
    area: 377930.0,
    currency: 'JPY',
    languages: ['jpn'],
    flag: '🇯🇵',
    lat: 36.2048,
    lng: 138.2529,
    timezone: 'UTC+9',
  },
  {
    id: 'CHN',
    name: 'China',
    capital: 'Beijing',
    population: 1439323776n,
    region: 'Asia',
    subregion: 'Eastern Asia',
    area: 9706961.0,
    currency: 'CNY',
    languages: ['zho'],
    flag: '🇨🇳',
    lat: 35.8617,
    lng: 104.1954,
    timezone: 'UTC+8',
  },
  {
    id: 'IND',
    name: 'India',
    capital: 'New Delhi',
    population: 1380004385n,
    region: 'Asia',
    subregion: 'Southern Asia',
    area: 3287263.0,
    currency: 'INR',
    languages: ['hin', 'eng'],
    flag: '🇮🇳',
    lat: 20.5937,
    lng: 78.9629,
    timezone: 'UTC+5:30',
  },
  {
    id: 'BRA',
    name: 'Brazil',
    capital: 'Brasília',
    population: 212559417n,
    region: 'Americas',
    subregion: 'South America',
    area: 8515767.0,
    currency: 'BRL',
    languages: ['por'],
    flag: '🇧🇷',
    lat: -14.2350,
    lng: -51.9253,
    timezone: 'UTC-3',
  },
  {
    id: 'AUS',
    name: 'Australia',
    capital: 'Canberra',
    population: 25499884n,
    region: 'Oceania',
    subregion: 'Australia and New Zealand',
    area: 7692024.0,
    currency: 'AUD',
    languages: ['eng'],
    flag: '🇦🇺',
    lat: -25.2744,
    lng: 133.7751,
    timezone: 'UTC+10',
  },
  {
    id: 'RUS',
    name: 'Russia',
    capital: 'Moscow',
    population: 145934462n,
    region: 'Europe',
    subregion: 'Eastern Europe',
    area: 17098242.0,
    currency: 'RUB',
    languages: ['rus'],
    flag: '🇷🇺',
    lat: 61.5240,
    lng: 105.3188,
    timezone: 'UTC+3',
  },
  {
    id: 'MEX',
    name: 'Mexico',
    capital: 'Mexico City',
    population: 128932753n,
    region: 'Americas',
    subregion: 'Central America',
    area: 1964375.0,
    currency: 'MXN',
    languages: ['spa'],
    flag: '🇲🇽',
    lat: 23.6345,
    lng: -102.5528,
    timezone: 'UTC-6',
  },
  // Add more countries as needed - this is a sample set
];

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.country.deleteMany();
  console.log('Cleared existing countries');

  // Insert sample countries
  for (const country of countries) {
    const created = await prisma.country.create({
      data: country,
    });
    console.log(`Created country: ${created.name} (${created.id})`);
  }

  console.log(`Seeding finished. Created ${countries.length} countries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
