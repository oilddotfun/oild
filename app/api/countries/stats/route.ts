import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";
import { getAllClaims, getClaim, updateClaimStats } from "@/lib/store";
import { getNationStats } from "@/lib/dexscreener";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.toUpperCase();

  // Single country refresh
  if (code) {
    const claim = await getClaim(code);
    if (!claim?.tokenAddress) {
      return NextResponse.json({ error: "Country not claimed or no token" }, { status: 404 });
    }
    const stats = await getNationStats(claim.tokenAddress);
    if (stats.population > 0 || stats.gdp > 0) {
      await updateClaimStats(code, stats.population || claim.population, stats.gdp || claim.gdp);
    }
    return NextResponse.json({ code, population: stats.population, gdp: stats.gdp, timestamp: Date.now() });
  }

  // All claimed countries refresh
  const claims = await getAllClaims();
  const claimed = COUNTRIES
    .filter(c => claims.has(c.code) && claims.get(c.code)!.tokenAddress)
    .map(c => ({ code: c.code, claim: claims.get(c.code)! }));

  if (claimed.length === 0) {
    return NextResponse.json({ updated: 0, nations: [] });
  }

  const results: { code: string; population: number; gdp: number }[] = [];
  const batchSize = 5;

  for (let i = 0; i < claimed.length; i += batchSize) {
    const batch = claimed.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async ({ code, claim }) => {
        const stats = await getNationStats(claim.tokenAddress);
        if (stats.population > 0 || stats.gdp > 0) {
          await updateClaimStats(code, stats.population || claim.population, stats.gdp || claim.gdp);
        }
        return { code, population: stats.population, gdp: stats.gdp };
      })
    );
    results.push(...batchResults);
  }

  return NextResponse.json({ updated: results.length, nations: results, timestamp: Date.now() });
}
