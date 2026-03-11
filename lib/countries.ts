export interface Country {
  code: string;
  name: string;
  emoji: string;
  oil: number; // starting oil barrels
  region: string;
  x: number; // map position (% from left)
  y: number; // map position (% from top)
}

export const COUNTRIES: Country[] = [
  // Middle East - Oil Kings
  { code: "SA", name: "Saudi Arabia", emoji: "🇸🇦", oil: 1000, region: "Middle East", x: 57.5, y: 42 },
  { code: "IQ", name: "Iraq", emoji: "🇮🇶", oil: 800, region: "Middle East", x: 56.5, y: 38 },
  { code: "IR", name: "Iran", emoji: "🇮🇷", oil: 750, region: "Middle East", x: 59, y: 38 },
  { code: "KW", name: "Kuwait", emoji: "🇰🇼", oil: 600, region: "Middle East", x: 57, y: 40 },
  { code: "AE", name: "UAE", emoji: "🇦🇪", oil: 550, region: "Middle East", x: 59.5, y: 43 },
  { code: "QA", name: "Qatar", emoji: "🇶🇦", oil: 400, region: "Middle East", x: 58.5, y: 42 },

  // Americas
  { code: "US", name: "United States", emoji: "🇺🇸", oil: 800, region: "Americas", x: 20, y: 35 },
  { code: "CA", name: "Canada", emoji: "🇨🇦", oil: 700, region: "Americas", x: 20, y: 22 },
  { code: "VE", name: "Venezuela", emoji: "🇻🇪", oil: 900, region: "Americas", x: 26, y: 52 },
  { code: "BR", name: "Brazil", emoji: "🇧🇷", oil: 500, region: "Americas", x: 30, y: 62 },
  { code: "MX", name: "Mexico", emoji: "🇲🇽", oil: 350, region: "Americas", x: 16, y: 42 },
  { code: "CO", name: "Colombia", emoji: "🇨🇴", oil: 300, region: "Americas", x: 24, y: 54 },
  { code: "AR", name: "Argentina", emoji: "🇦🇷", oil: 250, region: "Americas", x: 28, y: 78 },
  { code: "EC", name: "Ecuador", emoji: "🇪🇨", oil: 200, region: "Americas", x: 22, y: 56 },

  // Europe
  { code: "RU", name: "Russia", emoji: "🇷🇺", oil: 750, region: "Europe", x: 65, y: 22 },
  { code: "NO", name: "Norway", emoji: "🇳🇴", oil: 450, region: "Europe", x: 48.5, y: 18 },
  { code: "GB", name: "United Kingdom", emoji: "🇬🇧", oil: 300, region: "Europe", x: 46, y: 25 },
  { code: "DE", name: "Germany", emoji: "🇩🇪", oil: 150, region: "Europe", x: 49, y: 27 },
  { code: "FR", name: "France", emoji: "🇫🇷", oil: 120, region: "Europe", x: 47.5, y: 30 },
  { code: "IT", name: "Italy", emoji: "🇮🇹", oil: 100, region: "Europe", x: 49.5, y: 32 },
  { code: "NL", name: "Netherlands", emoji: "🇳🇱", oil: 200, region: "Europe", x: 48, y: 26 },
  { code: "PL", name: "Poland", emoji: "🇵🇱", oil: 80, region: "Europe", x: 51, y: 26 },
  { code: "UA", name: "Ukraine", emoji: "🇺🇦", oil: 180, region: "Europe", x: 53, y: 28 },
  { code: "RO", name: "Romania", emoji: "🇷🇴", oil: 100, region: "Europe", x: 52, y: 30 },

  // Africa
  { code: "NG", name: "Nigeria", emoji: "🇳🇬", oil: 650, region: "Africa", x: 48, y: 52 },
  { code: "LY", name: "Libya", emoji: "🇱🇾", oil: 600, region: "Africa", x: 50, y: 40 },
  { code: "DZ", name: "Algeria", emoji: "🇩🇿", oil: 500, region: "Africa", x: 47.5, y: 38 },
  { code: "AO", name: "Angola", emoji: "🇦🇴", oil: 400, region: "Africa", x: 50, y: 62 },
  { code: "EG", name: "Egypt", emoji: "🇪🇬", oil: 350, region: "Africa", x: 53, y: 40 },
  { code: "ZA", name: "South Africa", emoji: "🇿🇦", oil: 100, region: "Africa", x: 52, y: 75 },
  { code: "GH", name: "Ghana", emoji: "🇬🇭", oil: 150, region: "Africa", x: 46.5, y: 52 },
  { code: "SS", name: "South Sudan", emoji: "🇸🇸", oil: 250, region: "Africa", x: 53.5, y: 52 },

  // Asia-Pacific
  { code: "CN", name: "China", emoji: "🇨🇳", oil: 500, region: "Asia", x: 72, y: 35 },
  { code: "IN", name: "India", emoji: "🇮🇳", oil: 300, region: "Asia", x: 64, y: 42 },
  { code: "ID", name: "Indonesia", emoji: "🇮🇩", oil: 350, region: "Asia", x: 75, y: 56 },
  { code: "MY", name: "Malaysia", emoji: "🇲🇾", oil: 250, region: "Asia", x: 73, y: 52 },
  { code: "AU", name: "Australia", emoji: "🇦🇺", oil: 200, region: "Asia", x: 80, y: 72 },
  { code: "JP", name: "Japan", emoji: "🇯🇵", oil: 50, region: "Asia", x: 80, y: 33 },
  { code: "KR", name: "South Korea", emoji: "🇰🇷", oil: 30, region: "Asia", x: 78, y: 35 },
  { code: "KZ", name: "Kazakhstan", emoji: "🇰🇿", oil: 500, region: "Asia", x: 62, y: 28 },
  { code: "TH", name: "Thailand", emoji: "🇹🇭", oil: 150, region: "Asia", x: 72, y: 48 },
  { code: "VN", name: "Vietnam", emoji: "🇻🇳", oil: 120, region: "Asia", x: 74, y: 47 },
  { code: "PH", name: "Philippines", emoji: "🇵🇭", oil: 80, region: "Asia", x: 78, y: 48 },
  { code: "PK", name: "Pakistan", emoji: "🇵🇰", oil: 150, region: "Asia", x: 62, y: 40 },
  { code: "BD", name: "Bangladesh", emoji: "🇧🇩", oil: 50, region: "Asia", x: 67, y: 43 },

  // Central Asia / Other
  { code: "AZ", name: "Azerbaijan", emoji: "🇦🇿", oil: 400, region: "Middle East", x: 57, y: 32 },
  { code: "TM", name: "Turkmenistan", emoji: "🇹🇲", oil: 350, region: "Asia", x: 60, y: 32 },
  { code: "UZ", name: "Uzbekistan", emoji: "🇺🇿", oil: 200, region: "Asia", x: 61, y: 30 },
  { code: "OM", name: "Oman", emoji: "🇴🇲", oil: 350, region: "Middle East", x: 60, y: 44 },
  { code: "BH", name: "Bahrain", emoji: "🇧🇭", oil: 200, region: "Middle East", x: 58, y: 41 },
  { code: "TR", name: "Turkey", emoji: "🇹🇷", oil: 150, region: "Europe", x: 54, y: 34 },
];

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code.toUpperCase());
}

export function getCountriesByOil(): Country[] {
  return [...COUNTRIES].sort((a, b) => b.oil - a.oil);
}
