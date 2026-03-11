import { sql, ensureTables } from "./db";

export interface Claim {
  claimedBy: string;
  tokenAddress: string;
  xCommunity: string;
  claimedAt: number;
  population: number;
  gdp: number;
  oilStolen: number;
  verified: boolean;
}

export async function getClaim(code: string): Promise<Claim | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM claims WHERE code = ${code.toUpperCase()}`;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    claimedBy: r.claimed_by,
    tokenAddress: r.token_address,
    xCommunity: r.x_community,
    claimedAt: Number(r.claimed_at),
    population: r.population,
    gdp: Number(r.gdp),
    oilStolen: r.oil_stolen,
    verified: r.verified,
  };
}

export async function getAllClaims(): Promise<Map<string, Claim>> {
  await ensureTables();
  const rows = await sql`SELECT * FROM claims`;
  const map = new Map<string, Claim>();
  for (const r of rows) {
    map.set(r.code, {
      claimedBy: r.claimed_by,
      tokenAddress: r.token_address,
      xCommunity: r.x_community,
      claimedAt: Number(r.claimed_at),
      population: r.population,
      gdp: Number(r.gdp),
      oilStolen: r.oil_stolen,
      verified: r.verified,
    });
  }
  return map;
}

export async function setClaim(code: string, claim: Claim): Promise<void> {
  await ensureTables();
  const c = code.toUpperCase();
  await sql`
    INSERT INTO claims (code, claimed_by, token_address, x_community, claimed_at, population, gdp, oil_stolen, verified)
    VALUES (${c}, ${claim.claimedBy}, ${claim.tokenAddress}, ${claim.xCommunity}, ${claim.claimedAt}, ${claim.population}, ${claim.gdp}, ${claim.oilStolen}, ${claim.verified})
    ON CONFLICT (code) DO UPDATE SET
      claimed_by = ${claim.claimedBy},
      token_address = ${claim.tokenAddress},
      x_community = ${claim.xCommunity},
      population = ${claim.population},
      gdp = ${claim.gdp},
      oil_stolen = ${claim.oilStolen},
      verified = ${claim.verified}
  `;
}

export async function isClaimed(code: string): Promise<boolean> {
  const claim = await getClaim(code);
  return claim !== null;
}

export async function isTokenUsed(tokenAddress: string): Promise<boolean> {
  await ensureTables();
  const rows = await sql`SELECT code FROM claims WHERE token_address = ${tokenAddress}`;
  return rows.length > 0;
}

export async function updateClaimStats(code: string, population: number, gdp: number): Promise<void> {
  await ensureTables();
  await sql`UPDATE claims SET population = ${population}, gdp = ${gdp} WHERE code = ${code.toUpperCase()}`;
}

export async function transferOil(fromCode: string, toCode: string, barrels: number): Promise<void> {
  await ensureTables();
  await sql`UPDATE claims SET oil_stolen = oil_stolen + ${barrels} WHERE code = ${toCode.toUpperCase()}`;
  // Note: oil_stolen on the loser increases too (tracks total stolen FROM them)
}
