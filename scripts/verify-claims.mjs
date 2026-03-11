import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_zueVRL5Y0MrE@ep-quiet-shape-ah4g0f02-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

const claims = await sql`SELECT * FROM claims`;
console.log(`Found ${claims.length} claims:\n`);

for (const c of claims) {
  // Check if token exists on DexScreener
  let exists = false;
  let mcap = 0;
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${c.token_address}`);
    const data = await res.json();
    if (data.pairs && data.pairs.length > 0) {
      exists = true;
      mcap = data.pairs[0].marketCap || 0;
    }
  } catch {}

  console.log(`${c.code} | token: ${c.token_address.slice(0,8)}... | DexScreener: ${exists ? `YES (mcap: $${mcap})` : 'NOT FOUND'}`);
  
  if (!exists) {
    // Also check Solana RPC if the mint account exists
    try {
      const rpc = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getAccountInfo', params: [c.token_address, { encoding: 'jsonParsed' }] }),
      });
      const rpcData = await rpc.json();
      if (rpcData.result?.value) {
        console.log(`  -> Mint account exists on-chain (may be too new for DexScreener)`);
        exists = true;
      } else {
        console.log(`  -> Mint account NOT found on-chain — FAKE`);
      }
    } catch {}
  }

  if (!exists) {
    console.log(`  -> DELETING claim for ${c.code}`);
    await sql`DELETE FROM claims WHERE code = ${c.code}`;
  }
}

console.log('\nDone. Remaining claims:');
const remaining = await sql`SELECT code, token_address FROM claims`;
console.log(remaining);
