/**
 * Mapping from UN M49 numeric country codes to ISO 3166-1 alpha-3 codes
 * Source: UN M49 standard (https://unstats.un.org/unsd/methodology/m49/)
 */
export const numericToIsoMapping: Record<string, string> = {
  // Africa
  '012': 'DZA', // Algeria
  '024': 'AGO', // Angola
  '072': 'BWA', // Botswana
  '108': 'BDI', // Burundi
  '120': 'CMR', // Cameroon
  '140': 'CAF', // Central African Republic
  '148': 'TCD', // Chad
  '178': 'COG', // Congo
  '180': 'COD', // Democratic Republic of the Congo
  '262': 'DJI', // Djibouti
  '818': 'EGY', // Egypt
  '226': 'GNQ', // Equatorial Guinea
  '232': 'ERI', // Eritrea
  '231': 'ETH', // Ethiopia
  '266': 'GAB', // Gabon
  '270': 'GMB', // Gambia
  '288': 'GHA', // Ghana
  '324': 'GIN', // Guinea
  '624': 'GNB', // Guinea-Bissau
  '384': 'CIV', // Ivory Coast / Côte d'Ivoire
  '404': 'KEN', // Kenya
  '426': 'LSO', // Lesotho
  '430': 'LBR', // Liberia
  '434': 'LBY', // Libya
  '450': 'MDG', // Madagascar
  '454': 'MWI', // Malawi
  '466': 'MLI', // Mali
  '478': 'MRT', // Mauritania
  '480': 'MUS', // Mauritius
  '504': 'MAR', // Morocco
  '508': 'MOZ', // Mozambique
  '516': 'NAM', // Namibia
  '562': 'NER', // Niger
  '566': 'NGA', // Nigeria
  '646': 'RWA', // Rwanda
  '686': 'SEN', // Senegal
  '694': 'SLE', // Sierra Leone
  '706': 'SOM', // Somalia
  '710': 'ZAF', // South Africa
  '728': 'SSD', // South Sudan
  '729': 'SDN', // Sudan
  '748': 'SWZ', // Eswatini (Swaziland)
  '834': 'TZA', // Tanzania
  '768': 'TGO', // Togo
  '788': 'TUN', // Tunisia
  '800': 'UGA', // Uganda
  '732': 'ESH', // Western Sahara
  '894': 'ZMB', // Zambia
  '716': 'ZWE', // Zimbabwe
  
  // Americas
  '028': 'ATG', // Antigua and Barbuda
  '032': 'ARG', // Argentina
  '044': 'BHS', // Bahamas
  '052': 'BRB', // Barbados
  '084': 'BLZ', // Belize
  '068': 'BOL', // Bolivia
  '076': 'BRA', // Brazil
  '124': 'CAN', // Canada
  '152': 'CHL', // Chile
  '170': 'COL', // Colombia
  '188': 'CRI', // Costa Rica
  '192': 'CUB', // Cuba
  '212': 'DMA', // Dominica
  '214': 'DOM', // Dominican Republic
  '218': 'ECU', // Ecuador
  '222': 'SLV', // El Salvador
  '308': 'GRD', // Grenada
  '320': 'GTM', // Guatemala
  '328': 'GUY', // Guyana
  '332': 'HTI', // Haiti
  '340': 'HND', // Honduras
  '388': 'JAM', // Jamaica
  '484': 'MEX', // Mexico
  '558': 'NIC', // Nicaragua
  '591': 'PAN', // Panama
  '600': 'PRY', // Paraguay
  '604': 'PER', // Peru
  '659': 'KNA', // Saint Kitts and Nevis
  '662': 'LCA', // Saint Lucia
  '670': 'VCT', // Saint Vincent and the Grenadines
  '740': 'SUR', // Suriname
  '780': 'TTO', // Trinidad and Tobago
  '840': 'USA', // United States of America
  '858': 'URY', // Uruguay
  '862': 'VEN', // Venezuela
  
  // Asia
  '004': 'AFG', // Afghanistan
  '051': 'ARM', // Armenia
  '031': 'AZE', // Azerbaijan
  '048': 'BHR', // Bahrain
  '050': 'BGD', // Bangladesh
  '064': 'BTN', // Bhutan
  '096': 'BRN', // Brunei
  '116': 'KHM', // Cambodia
  '156': 'CHN', // China
  '196': 'CYP', // Cyprus
  '268': 'GEO', // Georgia
  '356': 'IND', // India
  '360': 'IDN', // Indonesia
  '364': 'IRN', // Iran
  '368': 'IRQ', // Iraq
  '376': 'ISR', // Israel
  '392': 'JPN', // Japan
  '400': 'JOR', // Jordan
  '398': 'KAZ', // Kazakhstan
  '414': 'KWT', // Kuwait
  '417': 'KGZ', // Kyrgyzstan
  '418': 'LAO', // Laos
  '422': 'LBN', // Lebanon
  '458': 'MYS', // Malaysia
  '462': 'MDV', // Maldives
  '496': 'MNG', // Mongolia
  '104': 'MMR', // Myanmar
  '524': 'NPL', // Nepal
  '408': 'PRK', // North Korea
  '512': 'OMN', // Oman
  '586': 'PAK', // Pakistan
  '275': 'PSE', // Palestine
  '608': 'PHL', // Philippines
  '634': 'QAT', // Qatar
  '682': 'SAU', // Saudi Arabia
  '702': 'SGP', // Singapore
  '410': 'KOR', // South Korea
  '144': 'LKA', // Sri Lanka
  '760': 'SYR', // Syria
  '762': 'TJK', // Tajikistan
  '764': 'THA', // Thailand
  '626': 'TLS', // Timor-Leste
  '792': 'TUR', // Turkey
  '795': 'TKM', // Turkmenistan
  '784': 'ARE', // United Arab Emirates
  '860': 'UZB', // Uzbekistan
  '704': 'VNM', // Vietnam
  '887': 'YEM', // Yemen
  
  // Europe
  '008': 'ALB', // Albania
  '020': 'AND', // Andorra
  '040': 'AUT', // Austria
  '112': 'BLR', // Belarus
  '056': 'BEL', // Belgium
  '070': 'BIH', // Bosnia and Herzegovina
  '100': 'BGR', // Bulgaria
  '191': 'HRV', // Croatia
  '203': 'CZE', // Czech Republic
  '208': 'DNK', // Denmark
  '233': 'EST', // Estonia
  '246': 'FIN', // Finland
  '250': 'FRA', // France
  '276': 'DEU', // Germany
  '300': 'GRC', // Greece
  '348': 'HUN', // Hungary
  '352': 'ISL', // Iceland
  '372': 'IRL', // Ireland
  '380': 'ITA', // Italy
  '428': 'LVA', // Latvia
  '438': 'LIE', // Liechtenstein
  '440': 'LTU', // Lithuania
  '442': 'LUX', // Luxembourg
  '807': 'MKD', // North Macedonia
  '470': 'MLT', // Malta
  '498': 'MDA', // Moldova
  '492': 'MCO', // Monaco
  '499': 'MNE', // Montenegro
  '528': 'NLD', // Netherlands
  '578': 'NOR', // Norway
  '616': 'POL', // Poland
  '620': 'PRT', // Portugal
  '642': 'ROU', // Romania
  '643': 'RUS', // Russia
  '674': 'SMR', // San Marino
  '688': 'SRB', // Serbia
  '703': 'SVK', // Slovakia
  '705': 'SVN', // Slovenia
  '724': 'ESP', // Spain
  '752': 'SWE', // Sweden
  '756': 'CHE', // Switzerland
  '804': 'UKR', // Ukraine
  '826': 'GBR', // United Kingdom
  '336': 'VAT', // Vatican City
  
  // Oceania
  '036': 'AUS', // Australia
  '242': 'FJI', // Fiji
  '296': 'KIR', // Kiribati
  '584': 'MHL', // Marshall Islands
  '583': 'FSM', // Micronesia
  '520': 'NRU', // Nauru
  '554': 'NZL', // New Zealand
  '585': 'PLW', // Palau
  '598': 'PNG', // Papua New Guinea
  '882': 'WSM', // Samoa
  '090': 'SLB', // Solomon Islands
  '776': 'TON', // Tonga
  '798': 'TUV', // Tuvalu
  '548': 'VUT', // Vanuatu
};

/**
 * Convert UN M49 numeric country code to ISO 3166-1 alpha-3 code
 * @param numericCode - The numeric country code (e.g., "840" for USA)
 * @returns ISO alpha-3 code (e.g., "USA") or the original code if no mapping exists
 */
export function numericToIso(numericCode: string): string {
  // Normalize the input (remove leading zeros if needed for lookup, but preserve original format)
  const normalized = numericCode.padStart(3, '0');
  return numericToIsoMapping[normalized] || numericCode;
}

/**
 * Check if a code is a numeric country code
 * @param code - The code to check
 * @returns true if the code is numeric (UN M49 format)
 */
export function isNumericCountryCode(code: string): boolean {
  return /^\d+$/.test(code);
}
