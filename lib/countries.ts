export interface Country {
  code: string;      // ISO 3166-1 alpha-2
  numCode: string;   // ISO 3166-1 numeric (for TopoJSON matching)
  name: string;
  oil: number;       // proven reserves in millions of barrels (real data, EIA/OPEC/BP)
  region: string;
}

// Real proven oil reserves data (millions of barrels) from EIA/OPEC/BP 2024
export const COUNTRIES: Country[] = [
  // Top producers
  { code: "VE", numCode: "862", name: "Venezuela", oil: 304000, region: "South America" },
  { code: "SA", numCode: "682", name: "Saudi Arabia", oil: 267000, region: "Middle East" },
  { code: "IR", numCode: "364", name: "Iran", oil: 209000, region: "Middle East" },
  { code: "IQ", numCode: "368", name: "Iraq", oil: 145000, region: "Middle East" },
  { code: "CA", numCode: "124", name: "Canada", oil: 170000, region: "North America" },
  { code: "AE", numCode: "784", name: "United Arab Emirates", oil: 113000, region: "Middle East" },
  { code: "KW", numCode: "414", name: "Kuwait", oil: 102000, region: "Middle East" },
  { code: "RU", numCode: "643", name: "Russia", oil: 80000, region: "Europe" },
  { code: "US", numCode: "840", name: "United States", oil: 74000, region: "North America" },
  { code: "LY", numCode: "434", name: "Libya", oil: 50000, region: "Africa" },
  { code: "NG", numCode: "566", name: "Nigeria", oil: 37000, region: "Africa" },
  { code: "KZ", numCode: "398", name: "Kazakhstan", oil: 30000, region: "Central Asia" },
  { code: "CN", numCode: "156", name: "China", oil: 26000, region: "Asia" },
  { code: "QA", numCode: "634", name: "Qatar", oil: 25000, region: "Middle East" },
  { code: "BR", numCode: "076", name: "Brazil", oil: 13000, region: "South America" },
  { code: "DZ", numCode: "012", name: "Algeria", oil: 12000, region: "Africa" },
  { code: "GY", numCode: "328", name: "Guyana", oil: 11000, region: "South America" },
  { code: "EC", numCode: "218", name: "Ecuador", oil: 8300, region: "South America" },
  { code: "NO", numCode: "578", name: "Norway", oil: 7000, region: "Europe" },
  { code: "AO", numCode: "024", name: "Angola", oil: 7800, region: "Africa" },
  { code: "AZ", numCode: "031", name: "Azerbaijan", oil: 7000, region: "Central Asia" },
  { code: "MX", numCode: "484", name: "Mexico", oil: 6000, region: "North America" },
  { code: "OM", numCode: "512", name: "Oman", oil: 5400, region: "Middle East" },
  { code: "IN", numCode: "356", name: "India", oil: 4600, region: "Asia" },
  { code: "VN", numCode: "704", name: "Vietnam", oil: 4400, region: "Asia" },
  { code: "SS", numCode: "728", name: "South Sudan", oil: 3800, region: "Africa" },
  { code: "MY", numCode: "458", name: "Malaysia", oil: 3600, region: "Asia" },
  { code: "EG", numCode: "818", name: "Egypt", oil: 3300, region: "Africa" },
  { code: "AR", numCode: "032", name: "Argentina", oil: 3000, region: "South America" },
  { code: "CG", numCode: "178", name: "Congo", oil: 1800, region: "Africa" },
  { code: "GB", numCode: "826", name: "United Kingdom", oil: 2500, region: "Europe" },
  { code: "SY", numCode: "760", name: "Syria", oil: 2500, region: "Middle East" },
  { code: "ID", numCode: "360", name: "Indonesia", oil: 2500, region: "Asia" },
  { code: "AU", numCode: "036", name: "Australia", oil: 2400, region: "Oceania" },
  { code: "CO", numCode: "170", name: "Colombia", oil: 2000, region: "South America" },
  { code: "TR", numCode: "792", name: "Turkey", oil: 400, region: "Europe" },
  { code: "DE", numCode: "276", name: "Germany", oil: 130, region: "Europe" },
  { code: "FR", numCode: "250", name: "France", oil: 65, region: "Europe" },
  { code: "IT", numCode: "380", name: "Italy", oil: 600, region: "Europe" },
  { code: "PL", numCode: "616", name: "Poland", oil: 150, region: "Europe" },
  { code: "UA", numCode: "804", name: "Ukraine", oil: 395, region: "Europe" },
  { code: "RO", numCode: "642", name: "Romania", oil: 600, region: "Europe" },
  { code: "TH", numCode: "764", name: "Thailand", oil: 400, region: "Asia" },
  { code: "PK", numCode: "586", name: "Pakistan", oil: 350, region: "Asia" },
  { code: "JP", numCode: "392", name: "Japan", oil: 44, region: "Asia" },
  { code: "KR", numCode: "410", name: "South Korea", oil: 0, region: "Asia" },
  { code: "ZA", numCode: "710", name: "South Africa", oil: 15, region: "Africa" },
  { code: "NL", numCode: "528", name: "Netherlands", oil: 140, region: "Europe" },
  { code: "BD", numCode: "050", name: "Bangladesh", oil: 28, region: "Asia" },
  { code: "PH", numCode: "608", name: "Philippines", oil: 140, region: "Asia" },
  { code: "PE", numCode: "604", name: "Peru", oil: 1200, region: "South America" },
  { code: "TM", numCode: "795", name: "Turkmenistan", oil: 600, region: "Central Asia" },
  { code: "UZ", numCode: "860", name: "Uzbekistan", oil: 594, region: "Central Asia" },
  { code: "BH", numCode: "048", name: "Bahrain", oil: 186, region: "Middle East" },
  { code: "GH", numCode: "288", name: "Ghana", oil: 660, region: "Africa" },
  { code: "SD", numCode: "729", name: "Sudan", oil: 1500, region: "Africa" },
  { code: "TD", numCode: "148", name: "Chad", oil: 1500, region: "Africa" },
  { code: "GQ", numCode: "226", name: "Equatorial Guinea", oil: 1100, region: "Africa" },
  { code: "GA", numCode: "266", name: "Gabon", oil: 2000, region: "Africa" },
  { code: "TT", numCode: "780", name: "Trinidad and Tobago", oil: 220, region: "South America" },
];

// Lookup by numeric code (TopoJSON uses numeric IDs)
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
