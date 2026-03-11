export interface Claim {
  claimedBy: string;        // deployer wallet address = PRESIDENT
  tokenAddress: string;     // pump.fun token mint
  xCommunity: string;       // X community link
  claimedAt: number;        // timestamp
  population: number;       // token holder count
  gdp: number;              // token market cap in USD
  oilStolen: number;        // barrels stolen via raids
  verified: boolean;        // verified on-chain
}

// In-memory store (MVP — resets on redeploy)
const claims = new Map<string, Claim>();

export function getClaims(): Map<string, Claim> {
  return claims;
}

export function getClaim(code: string): Claim | undefined {
  return claims.get(code.toUpperCase());
}

export function setClaim(code: string, claim: Claim): void {
  claims.set(code.toUpperCase(), claim);
}

export function isClaimed(code: string): boolean {
  return claims.has(code.toUpperCase());
}
