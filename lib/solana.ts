import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const TREASURY_WALLET = "7MD7wsshhdpQkckCdRW2fcE7e6Q5vbjdh6mhFH5kNRdr";
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

const connection = new Connection(RPC_URL, "confirmed");

/**
 * Verify a SOL transfer to treasury wallet
 * Returns true if the tx sends >= minAmount SOL to treasury
 */
export async function verifyTreasuryPayment(
  txSignature: string,
  minAmount: number = 1,
  fromWallet?: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { valid: false, error: "Transaction not found. It may not be confirmed yet." };
    }

    if (tx.meta?.err) {
      return { valid: false, error: "Transaction failed on-chain." };
    }

    // Check for SOL transfer to treasury
    const instructions = tx.transaction.message.instructions;
    let treasuryReceived = 0;

    for (const ix of instructions) {
      if ("parsed" in ix && ix.program === "system" && ix.parsed?.type === "transfer") {
        const info = ix.parsed.info;
        if (info.destination === TREASURY_WALLET) {
          treasuryReceived += info.lamports / LAMPORTS_PER_SOL;

          // Optionally verify sender
          if (fromWallet && info.source !== fromWallet) {
            continue; // wrong sender, skip
          }
        }
      }
    }

    if (treasuryReceived < minAmount) {
      return { valid: false, error: `Treasury received ${treasuryReceived} SOL, need at least ${minAmount} SOL.` };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: `Verification failed: ${err instanceof Error ? err.message : "unknown error"}` };
  }
}
