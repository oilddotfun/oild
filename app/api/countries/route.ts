import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";
import { getClaims } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const claims = getClaims();
  const countries = COUNTRIES.map(c => ({
    ...c,
    claimed: !!claims[c.code],
    claim: claims[c.code] || null,
  }));
  const totalClaimed = Object.keys(claims).length;
  const totalOil = COUNTRIES.reduce((sum, c) => sum + c.oil, 0);
  return NextResponse.json({ countries, totalClaimed, totalOil, totalCountries: COUNTRIES.length });
}
