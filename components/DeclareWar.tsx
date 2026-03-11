"use client";

import { useState } from "react";

interface DeclareWarProps {
  attackerCode: string;
  defenderCode: string;
  defenderName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const TREASURY = "7MD7wsshhdpQkckCdRW2fcE7e6Q5vbjdh6mhFH5kNRdr";

export default function DeclareWar({ attackerCode, defenderCode, defenderName, onSuccess, onClose }: DeclareWarProps) {
  const [step, setStep] = useState<"confirm" | "sending" | "verifying" | "success" | "error">("confirm");
  const [error, setError] = useState("");
  const [warResult, setWarResult] = useState<{ message: string } | null>(null);

  const handleDeclareWar = async () => {
    setStep("sending");
    setError("");

    try {
      // Check if Phantom is installed
      const phantom = (window as unknown as { solana?: { isPhantom: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }>; signTransaction: (tx: unknown) => Promise<unknown> } }).solana;

      if (!phantom?.isPhantom) {
        setError("Phantom wallet not found. Install it at phantom.app");
        setStep("error");
        return;
      }

      // Connect wallet
      const resp = await phantom.connect();
      const walletAddress = resp.publicKey.toString();

      // Create and send SOL transfer
      const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import("@solana/web3.js");

      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      const fromPubkey = new PublicKey(walletAddress);
      const toPubkey = new PublicKey(TREASURY);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: 1 * LAMPORTS_PER_SOL, // 1 SOL
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Sign with Phantom
      const signed = await phantom.signTransaction(transaction);
      const txSig = await connection.sendRawTransaction((signed as { serialize: () => Buffer }).serialize());

      setStep("verifying");

      // Wait for confirmation
      await connection.confirmTransaction(txSig, "confirmed");

      // Submit to our API
      const apiRes = await fetch("/api/wars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attackerCode,
          defenderCode,
          wallet: walletAddress,
          txSignature: txSig,
        }),
      });

      const data = await apiRes.json();

      if (!apiRes.ok) {
        setError(data.error || "War declaration failed");
        setStep("error");
        return;
      }

      setWarResult(data);
      setStep("success");
      onSuccess?.();

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (msg.includes("User rejected")) {
        setError("Transaction cancelled");
      } else {
        setError(msg);
      }
      setStep("error");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 250,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14,
        maxWidth: 400, width: "100%", padding: 28,
      }}>
        {step === "confirm" && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#EF4444", margin: "0 0 8px" }}>Declare War</h3>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px", lineHeight: 1.6 }}>
              You are about to attack <strong style={{ color: "#E8E0D0" }}>{defenderName}</strong>.
              This will cost <strong style={{ color: "#D4A017" }}>1 SOL</strong> sent to the OILD treasury.
            </p>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#666" }}>Cost</span>
                <span style={{ color: "#D4A017", fontWeight: 700 }}>1 SOL</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#666" }}>Missile Bonus</span>
                <span style={{ color: "#22C55E" }}>+$100,000 volume</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#666" }}>Duration</span>
                <span style={{ color: "#E8E0D0" }}>10 minutes</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#666" }}>Winner takes</span>
                <span style={{ color: "#EF4444" }}>5% of loser&apos;s oil</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: "12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#888", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={handleDeclareWar} style={{
                flex: 1, padding: "12px", borderRadius: 8, border: "none",
                background: "#EF4444", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>Send 1 SOL + Declare War</button>
            </div>
          </>
        )}

        {step === "sending" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 16, animation: "pulse 1.5s ease-in-out infinite" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#D4A017"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/></svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#E8E0D0", margin: "0 0 6px" }}>Approve in Phantom</p>
            <p style={{ fontSize: 12, color: "#666" }}>Sending 1 SOL to treasury...</p>
          </div>
        )}

        {step === "verifying" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 16, animation: "pulse 1s ease-in-out infinite" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/></svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#E8E0D0", margin: "0 0 6px" }}>Verifying on-chain...</p>
            <p style={{ fontSize: 12, color: "#666" }}>Confirming payment and launching missile</p>
          </div>
        )}

        {step === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#EF4444"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/></svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#EF4444", margin: "0 0 8px" }}>WAR DECLARED</p>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px", lineHeight: 1.6 }}>
              {warResult?.message || `Missile launched at ${defenderName}! 10-minute war has begun.`}
            </p>
            <button onClick={onClose} style={{
              padding: "12px 32px", borderRadius: 8, border: "none",
              background: "#D4A017", color: "#0A0A0A", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>Watch the War</button>
          </div>
        )}

        {step === "error" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#EF4444", margin: "0 0 8px" }}>Failed</p>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px" }}>{error}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={onClose} style={{
                padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#888", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={() => setStep("confirm")} style={{
                padding: "10px 20px", borderRadius: 8, border: "none",
                background: "#EF4444", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Try Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
