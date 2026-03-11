/**
 * DexScreener API integration for live volume tracking
 * https://docs.dexscreener.com/api/reference
 */

interface DexPair {
  baseToken: { address: string; name: string; symbol: string };
  volume: { m5: number; h1: number; h6: number; h24: number };
  marketCap: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface TokenData {
  volume5m: number;
  volume1h: number;
  volume24h: number;
  marketCap: number;
  holders: number; // not available from DexScreener, need separate source
}

/**
 * Get token data from DexScreener
 */
export async function getTokenData(tokenAddress: string): Promise<TokenData | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      headers: { "User-Agent": "OILD.fun/1.0" },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const pairs: DexPair[] = data.pairs || [];

    if (pairs.length === 0) return null;

    // Use the pair with highest liquidity
    const main = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

    return {
      volume5m: main.volume?.m5 || 0,
      volume1h: main.volume?.h1 || 0,
      volume24h: main.volume?.h24 || 0,
      marketCap: main.marketCap || 0,
      holders: 0, // DexScreener doesn't provide this — need pump.fun or on-chain
    };
  } catch {
    return null;
  }
}

/**
 * Get volume for a token during a specific time window
 * We snapshot volume at war start and war end, the difference is war volume
 */
export async function getWarVolume(tokenAddress: string): Promise<number> {
  const data = await getTokenData(tokenAddress);
  if (!data) return 0;
  // For 10-minute wars, use 5m volume * 2 as approximation
  // In production, we'd snapshot h1 volume at start and end
  return data.volume5m * 2;
}

/**
 * Get token holder count from pump.fun
 * Note: pump.fun API is limited, may need RPC call instead
 */
export async function getTokenHolders(tokenAddress: string): Promise<number> {
  try {
    // Try Helius DAS API (if configured)
    const heliusKey = process.env.HELIUS_API_KEY;
    if (heliusKey) {
      const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "oild",
          method: "getTokenAccounts",
          params: { mint: tokenAddress, limit: 1, page: 1 },
        }),
      });
      const data = await res.json();
      return data.result?.total || 0;
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * Fetch full nation stats (population + GDP) for a claimed token
 */
export async function getNationStats(tokenAddress: string): Promise<{ population: number; gdp: number }> {
  const [tokenData, holders] = await Promise.all([
    getTokenData(tokenAddress),
    getTokenHolders(tokenAddress),
  ]);

  return {
    population: holders,
    gdp: tokenData?.marketCap || 0,
  };
}
