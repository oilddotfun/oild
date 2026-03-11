// Simple in-memory store for MVP (replace with DB later)
// In production, use Neon PostgreSQL

export interface Claim {
  claimedBy: string; // wallet address
  tokenAddress: string;
  xCommunity: string;
  claimedAt: number;
  oilStolen: number; // oil stolen via raids
}

export interface ClaimStore {
  [countryCode: string]: Claim;
}

// For MVP: in-memory store (resets on redeploy — fine for launch)
const claims: ClaimStore = {};

export function getClaims(): ClaimStore {
  return { ...claims };
}

export function getClaim(code: string): Claim | null {
  return claims[code.toUpperCase()] || null;
}

export function setClaim(code: string, claim: Claim): void {
  claims[code.toUpperCase()] = claim;
}

export function isClaimed(code: string): boolean {
  return !!claims[code.toUpperCase()];
}
