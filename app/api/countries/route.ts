import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";
import { getClaim } from "@/lib/store";

export async function GET() {
  const countries = COUNTRIES.map(c => {
    const claim = getClaim(c.code);
    return {
      ...c,
      claimed: !!claim,
      claim: claim ? {
        president: claim.claimedBy,
        tokenAddress: claim.tokenAddress,
        xCommunity: claim.xCommunity,
        claimedAt: claim.claimedAt,
        population: claim.population,
        gdp: claim.gdp,
        oilStolen: claim.oilStolen,
        verified: claim.verified,
      } : null,
    };
  });

  const totalClaimed = countries.filter(c => c.claimed).length;
  const totalOil = COUNTRIES.reduce((sum, c) => sum + c.oil, 0);
  const totalCountries = COUNTRIES.length;

  return NextResponse.json({ countries, totalClaimed, totalOil, totalCountries });
}
