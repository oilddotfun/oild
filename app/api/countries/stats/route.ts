import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";
import { getClaim } from "@/lib/store";
import { getNationStats } from "@/lib/dexscreener";

/**
 * GET /api/countries/stats — refresh live population (holders) + GDP (mcap)
 * for all claimed nations via DexScreener + Helius
 */
export async function GET() {
  const claimed = COUNTRIES
    .filter(c => {
      const claim = getClaim(c.code);
      return claim && claim.tokenAddress;
    })
    .map(c => ({ code: c.code, claim: getClaim(c.code)! }));

  if (claimed.length === 0) {
    return NextResponse.json({ updated: 0, nations: [] });
  }

  // Fetch stats in parallel (max 5 concurrent to avoid rate limits)
  const results: { code: string; population: number; gdp: number }[] = [];
  const batchSize = 5;

  for (let i = 0; i < claimed.length; i += batchSize) {
    const batch = claimed.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async ({ code, claim }) => {
        const stats = await getNationStats(claim.tokenAddress);
        // Update the claim in-memory
        if (stats.population > 0) claim.population = stats.population;
        if (stats.gdp > 0) claim.gdp = stats.gdp;
        return { code, population: stats.population, gdp: stats.gdp };
      })
    );
    results.push(...batchResults);
  }

  return NextResponse.json({
    updated: results.length,
    nations: results,
    timestamp: Date.now(),
  });
}
