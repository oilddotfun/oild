export interface Country {
  code: string;       // ISO alpha-2
  numCode: string;    // ISO numeric (for TopoJSON)
  name: string;
  oil: number;        // proven reserves in millions of barrels (EIA/OPEC/BP real data)
  region: string;
}

export interface CountryState extends Country {
  claimed: boolean;
  claim: ClaimData | null;
}

export interface ClaimData {
  claimedBy: string;      // deployer wallet = President
  tokenAddress: string;   // pump.fun token
  xCommunity: string;     // X community link
  claimedAt: number;
  population: number;     // token holders count
  gdp: number;            // token market cap in USD
  oilStolen: number;      // barrels stolen via raids
}

// Real proven oil reserves (millions of barrels) — EIA/OPEC/BP 2024 data
// Every country with significant reserves + major nations
export const COUNTRIES: Country[] = [
  // Mega reserves
  { code: "VE", numCode: "862", name: "Venezuela", oil: 303806, region: "South America" },
  { code: "SA", numCode: "682", name: "Saudi Arabia", oil: 267026, region: "Middle East" },
  { code: "IR", numCode: "364", name: "Iran", oil: 208600, region: "Middle East" },
  { code: "CA", numCode: "124", name: "Canada", oil: 170300, region: "North America" },
  { code: "IQ", numCode: "368", name: "Iraq", oil: 145019, region: "Middle East" },
  { code: "AE", numCode: "784", name: "UAE", oil: 113000, region: "Middle East" },
  { code: "KW", numCode: "414", name: "Kuwait", oil: 101500, region: "Middle East" },
  { code: "RU", numCode: "643", name: "Russia", oil: 80000, region: "Europe" },
  { code: "US", numCode: "840", name: "United States", oil: 74000, region: "North America" },
  { code: "LY", numCode: "434", name: "Libya", oil: 48363, region: "Africa" },
  // Large reserves
  { code: "NG", numCode: "566", name: "Nigeria", oil: 36972, region: "Africa" },
  { code: "KZ", numCode: "398", name: "Kazakhstan", oil: 30000, region: "Central Asia" },
  { code: "CN", numCode: "156", name: "China", oil: 26023, region: "Asia" },
  { code: "QA", numCode: "634", name: "Qatar", oil: 25244, region: "Middle East" },
  { code: "BR", numCode: "076", name: "Brazil", oil: 12715, region: "South America" },
  { code: "DZ", numCode: "012", name: "Algeria", oil: 12200, region: "Africa" },
  { code: "GY", numCode: "328", name: "Guyana", oil: 11000, region: "South America" },
  { code: "EC", numCode: "218", name: "Ecuador", oil: 8273, region: "South America" },
  { code: "AO", numCode: "024", name: "Angola", oil: 7783, region: "Africa" },
  { code: "AZ", numCode: "031", name: "Azerbaijan", oil: 7000, region: "Central Asia" },
  { code: "NO", numCode: "578", name: "Norway", oil: 6902, region: "Europe" },
  { code: "MX", numCode: "484", name: "Mexico", oil: 5786, region: "North America" },
  { code: "OM", numCode: "512", name: "Oman", oil: 5373, region: "Middle East" },
  { code: "IN", numCode: "356", name: "India", oil: 4600, region: "Asia" },
  { code: "VN", numCode: "704", name: "Vietnam", oil: 4400, region: "Asia" },
  { code: "SS", numCode: "728", name: "South Sudan", oil: 3750, region: "Africa" },
  { code: "MY", numCode: "458", name: "Malaysia", oil: 3600, region: "Asia" },
  { code: "EG", numCode: "818", name: "Egypt", oil: 3300, region: "Africa" },
  { code: "AR", numCode: "032", name: "Argentina", oil: 2482, region: "South America" },
  { code: "GB", numCode: "826", name: "United Kingdom", oil: 2564, region: "Europe" },
  { code: "SY", numCode: "760", name: "Syria", oil: 2500, region: "Middle East" },
  { code: "ID", numCode: "360", name: "Indonesia", oil: 2482, region: "Asia" },
  { code: "AU", numCode: "036", name: "Australia", oil: 2446, region: "Oceania" },
  { code: "CO", numCode: "170", name: "Colombia", oil: 2036, region: "South America" },
  { code: "GA", numCode: "266", name: "Gabon", oil: 2000, region: "Africa" },
  { code: "CG", numCode: "178", name: "Congo", oil: 1800, region: "Africa" },
  { code: "TD", numCode: "148", name: "Chad", oil: 1500, region: "Africa" },
  { code: "SD", numCode: "729", name: "Sudan", oil: 1500, region: "Africa" },
  { code: "PE", numCode: "604", name: "Peru", oil: 1200, region: "South America" },
  { code: "GQ", numCode: "226", name: "Equatorial Guinea", oil: 1100, region: "Africa" },
  { code: "GH", numCode: "288", name: "Ghana", oil: 660, region: "Africa" },
  { code: "RO", numCode: "642", name: "Romania", oil: 600, region: "Europe" },
  { code: "IT", numCode: "380", name: "Italy", oil: 600, region: "Europe" },
  { code: "TM", numCode: "795", name: "Turkmenistan", oil: 600, region: "Central Asia" },
  { code: "UZ", numCode: "860", name: "Uzbekistan", oil: 594, region: "Central Asia" },
  { code: "TR", numCode: "792", name: "Turkey", oil: 400, region: "Europe" },
  { code: "UA", numCode: "804", name: "Ukraine", oil: 395, region: "Europe" },
  { code: "TH", numCode: "764", name: "Thailand", oil: 396, region: "Asia" },
  { code: "PK", numCode: "586", name: "Pakistan", oil: 350, region: "Asia" },
  { code: "TT", numCode: "780", name: "Trinidad and Tobago", oil: 220, region: "South America" },
  { code: "BH", numCode: "048", name: "Bahrain", oil: 186, region: "Middle East" },
  { code: "PL", numCode: "616", name: "Poland", oil: 150, region: "Europe" },
  { code: "NL", numCode: "528", name: "Netherlands", oil: 137, region: "Europe" },
  { code: "PH", numCode: "608", name: "Philippines", oil: 139, region: "Asia" },
  { code: "DE", numCode: "276", name: "Germany", oil: 132, region: "Europe" },
  { code: "FR", numCode: "250", name: "France", oil: 61, region: "Europe" },
  { code: "JP", numCode: "392", name: "Japan", oil: 44, region: "Asia" },
  { code: "BD", numCode: "050", name: "Bangladesh", oil: 28, region: "Asia" },
  { code: "ZA", numCode: "710", name: "South Africa", oil: 15, region: "Africa" },
  { code: "KR", numCode: "410", name: "South Korea", oil: 0, region: "Asia" },
  // Additional notable countries (minimal/no reserves but important on map)
  { code: "SE", numCode: "752", name: "Sweden", oil: 0, region: "Europe" },
  { code: "FI", numCode: "246", name: "Finland", oil: 0, region: "Europe" },
  { code: "NZ", numCode: "554", name: "New Zealand", oil: 40, region: "Oceania" },
  { code: "CL", numCode: "152", name: "Chile", oil: 150, region: "South America" },
  { code: "ZW", numCode: "716", name: "Zimbabwe", oil: 0, region: "Africa" },
  { code: "KE", numCode: "404", name: "Kenya", oil: 0, region: "Africa" },
  { code: "TZ", numCode: "834", name: "Tanzania", oil: 0, region: "Africa" },
  { code: "ET", numCode: "231", name: "Ethiopia", oil: 0, region: "Africa" },
  { code: "CD", numCode: "180", name: "DR Congo", oil: 180, region: "Africa" },
  { code: "MZ", numCode: "508", name: "Mozambique", oil: 0, region: "Africa" },
  { code: "MG", numCode: "450", name: "Madagascar", oil: 0, region: "Africa" },
  { code: "MM", numCode: "104", name: "Myanmar", oil: 139, region: "Asia" },
  { code: "AF", numCode: "004", name: "Afghanistan", oil: 0, region: "Asia" },
  { code: "NP", numCode: "524", name: "Nepal", oil: 0, region: "Asia" },
  { code: "KH", numCode: "116", name: "Cambodia", oil: 0, region: "Asia" },
  { code: "LA", numCode: "418", name: "Laos", oil: 0, region: "Asia" },
  { code: "MN", numCode: "496", name: "Mongolia", oil: 25, region: "Asia" },
  { code: "PG", numCode: "598", name: "Papua New Guinea", oil: 170, region: "Oceania" },
  { code: "BO", numCode: "068", name: "Bolivia", oil: 211, region: "South America" },
  { code: "PY", numCode: "600", name: "Paraguay", oil: 0, region: "South America" },
  { code: "UY", numCode: "858", name: "Uruguay", oil: 0, region: "South America" },
  { code: "CR", numCode: "188", name: "Costa Rica", oil: 0, region: "Central America" },
  { code: "PA", numCode: "591", name: "Panama", oil: 0, region: "Central America" },
  { code: "CU", numCode: "192", name: "Cuba", oil: 124, region: "Central America" },
  { code: "DO", numCode: "214", name: "Dominican Republic", oil: 0, region: "Central America" },
  { code: "HT", numCode: "332", name: "Haiti", oil: 0, region: "Central America" },
  { code: "GT", numCode: "320", name: "Guatemala", oil: 83, region: "Central America" },
  { code: "HN", numCode: "340", name: "Honduras", oil: 0, region: "Central America" },
  { code: "SV", numCode: "222", name: "El Salvador", oil: 0, region: "Central America" },
  { code: "NI", numCode: "558", name: "Nicaragua", oil: 0, region: "Central America" },
  { code: "IE", numCode: "372", name: "Ireland", oil: 0, region: "Europe" },
  { code: "IS", numCode: "352", name: "Iceland", oil: 0, region: "Europe" },
  { code: "PT", numCode: "620", name: "Portugal", oil: 0, region: "Europe" },
  { code: "ES", numCode: "724", name: "Spain", oil: 150, region: "Europe" },
  { code: "GR", numCode: "300", name: "Greece", oil: 10, region: "Europe" },
  { code: "BG", numCode: "100", name: "Bulgaria", oil: 15, region: "Europe" },
  { code: "RS", numCode: "688", name: "Serbia", oil: 78, region: "Europe" },
  { code: "HR", numCode: "191", name: "Croatia", oil: 71, region: "Europe" },
  { code: "AT", numCode: "040", name: "Austria", oil: 37, region: "Europe" },
  { code: "CH", numCode: "756", name: "Switzerland", oil: 0, region: "Europe" },
  { code: "CZ", numCode: "203", name: "Czech Republic", oil: 15, region: "Europe" },
  { code: "HU", numCode: "348", name: "Hungary", oil: 24, region: "Europe" },
  { code: "SK", numCode: "703", name: "Slovakia", oil: 9, region: "Europe" },
  { code: "DK", numCode: "208", name: "Denmark", oil: 441, region: "Europe" },
  { code: "BE", numCode: "056", name: "Belgium", oil: 0, region: "Europe" },
  { code: "BY", numCode: "112", name: "Belarus", oil: 60, region: "Europe" },
  { code: "LT", numCode: "440", name: "Lithuania", oil: 12, region: "Europe" },
  { code: "LV", numCode: "428", name: "Latvia", oil: 0, region: "Europe" },
  { code: "EE", numCode: "233", name: "Estonia", oil: 0, region: "Europe" },
  { code: "GE", numCode: "268", name: "Georgia", oil: 35, region: "Europe" },
  { code: "AL", numCode: "008", name: "Albania", oil: 168, region: "Europe" },
  { code: "BA", numCode: "070", name: "Bosnia", oil: 0, region: "Europe" },
  { code: "MK", numCode: "807", name: "North Macedonia", oil: 0, region: "Europe" },
  { code: "ME", numCode: "499", name: "Montenegro", oil: 0, region: "Europe" },
  { code: "XK", numCode: "-10", name: "Kosovo", oil: 0, region: "Europe" },
  { code: "MD", numCode: "498", name: "Moldova", oil: 0, region: "Europe" },
  { code: "LB", numCode: "422", name: "Lebanon", oil: 0, region: "Middle East" },
  { code: "JO", numCode: "400", name: "Jordan", oil: 1, region: "Middle East" },
  { code: "IL", numCode: "376", name: "Israel", oil: 14, region: "Middle East" },
  { code: "YE", numCode: "887", name: "Yemen", oil: 3000, region: "Middle East" },
  { code: "TN", numCode: "788", name: "Tunisia", oil: 425, region: "Africa" },
  { code: "MA", numCode: "504", name: "Morocco", oil: 684, region: "Africa" },
  { code: "SN", numCode: "686", name: "Senegal", oil: 0, region: "Africa" },
  { code: "ML", numCode: "466", name: "Mali", oil: 0, region: "Africa" },
  { code: "NE", numCode: "562", name: "Niger", oil: 150, region: "Africa" },
  { code: "BF", numCode: "854", name: "Burkina Faso", oil: 0, region: "Africa" },
  { code: "CI", numCode: "384", name: "Ivory Coast", oil: 100, region: "Africa" },
  { code: "CM", numCode: "120", name: "Cameroon", oil: 200, region: "Africa" },
  { code: "CF", numCode: "140", name: "Central African Republic", oil: 0, region: "Africa" },
  { code: "MR", numCode: "478", name: "Mauritania", oil: 20, region: "Africa" },
  { code: "NA", numCode: "516", name: "Namibia", oil: 0, region: "Africa" },
  { code: "BW", numCode: "072", name: "Botswana", oil: 0, region: "Africa" },
  { code: "ZM", numCode: "894", name: "Zambia", oil: 0, region: "Africa" },
  { code: "AW", numCode: "533", name: "Angola", oil: 0, region: "Africa" },
  { code: "SO", numCode: "706", name: "Somalia", oil: 0, region: "Africa" },
  { code: "ER", numCode: "232", name: "Eritrea", oil: 0, region: "Africa" },
  { code: "DJ", numCode: "262", name: "Djibouti", oil: 0, region: "Africa" },
  { code: "UG", numCode: "800", name: "Uganda", oil: 2500, region: "Africa" },
  { code: "RW", numCode: "646", name: "Rwanda", oil: 0, region: "Africa" },
  { code: "BI", numCode: "108", name: "Burundi", oil: 0, region: "Africa" },
  { code: "MW", numCode: "454", name: "Malawi", oil: 0, region: "Africa" },
  { code: "SL", numCode: "694", name: "Sierra Leone", oil: 0, region: "Africa" },
  { code: "LR", numCode: "430", name: "Liberia", oil: 0, region: "Africa" },
  { code: "GN", numCode: "324", name: "Guinea", oil: 0, region: "Africa" },
  { code: "GW", numCode: "624", name: "Guinea-Bissau", oil: 0, region: "Africa" },
  { code: "GM", numCode: "270", name: "Gambia", oil: 0, region: "Africa" },
  { code: "TG", numCode: "768", name: "Togo", oil: 0, region: "Africa" },
  { code: "BJ", numCode: "204", name: "Benin", oil: 8, region: "Africa" },
  { code: "LS", numCode: "426", name: "Lesotho", oil: 0, region: "Africa" },
  { code: "SZ", numCode: "748", name: "Eswatini", oil: 0, region: "Africa" },
  { code: "KG", numCode: "417", name: "Kyrgyzstan", oil: 40, region: "Central Asia" },
  { code: "TJ", numCode: "762", name: "Tajikistan", oil: 12, region: "Central Asia" },
  { code: "BN", numCode: "096", name: "Brunei", oil: 1100, region: "Asia" },
  { code: "LK", numCode: "144", name: "Sri Lanka", oil: 0, region: "Asia" },
  { code: "TW", numCode: "158", name: "Taiwan", oil: 2, region: "Asia" },
  { code: "KP", numCode: "408", name: "North Korea", oil: 0, region: "Asia" },
];

const numCodeMap = new Map(COUNTRIES.map(c => [c.numCode, c]));
const alphaCodeMap = new Map(COUNTRIES.map(c => [c.code, c]));

export function getCountryByNumCode(numCode: string): Country | undefined {
  return numCodeMap.get(numCode);
}

export function getCountry(code: string): Country | undefined {
  return alphaCodeMap.get(code.toUpperCase());
}

export function getCountriesByOil(): Country[] {
  return [...COUNTRIES].sort((a, b) => b.oil - a.oil);
}
