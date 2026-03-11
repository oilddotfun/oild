/**
 * Verify a Solana token mint exists on-chain
 * Checks: 1) DexScreener for trading pair  2) Solana RPC for mint account
 */

export async function verifyTokenExists(tokenAddress: string): Promise<{ valid: boolean; source: string; marketCap?: number }> {
  // 1. Check DexScreener (proves token is trading)
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      headers: { "User-Agent": "OILD.fun/1.0" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.pairs && data.pairs.length > 0) {
        return { valid: true, source: "dexscreener", marketCap: data.pairs[0].marketCap || 0 };
      }
    }
  } catch { /* continue to RPC check */ }

  // 2. Check Solana RPC (proves mint account exists on-chain)
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "verify-mint",
        method: "getAccountInfo",
        params: [tokenAddress, { encoding: "jsonParsed" }],
      }),
    });
    const data = await res.json();
    const account = data.result?.value;
    if (account) {
      // Check it's actually a token mint (SPL Token program)
      const owner = account.owner;
      if (owner === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" || owner === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
        return { valid: true, source: "solana-rpc" };
      }
    }
  } catch { /* fail */ }

  return { valid: false, source: "none" };
}
