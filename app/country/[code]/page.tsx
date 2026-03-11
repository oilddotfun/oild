"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CountryDetail {
  code: string; name: string; emoji: string; oil: number;
  region: string; x: number; y: number;
  claimed: boolean;
  claim: { claimedBy: string; tokenAddress: string; xCommunity: string; claimedAt: number; oilStolen: number } | null;
}

export default function CountryPage() {
  const params = useParams();
  const code = (params.code as string || "").toUpperCase();
  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimForm, setClaimForm] = useState({ wallet: "", tokenAddress: "", xCommunity: "" });
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => {
      const found = (d.countries || []).find((c: CountryDetail) => c.code === code);
      setCountry(found || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [code]);

  const handleClaim = async () => {
    if (!claimForm.wallet) { setError("Wallet address required"); return; }
    setClaiming(true); setError("");
    try {
      const res = await fetch("/api/countries/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, ...claimForm }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setClaiming(false); return; }
      // Refresh
      const d = await fetch("/api/countries").then(r => r.json());
      const found = (d.countries || []).find((c: CountryDetail) => c.code === code);
      setCountry(found || null);
      setShowClaimModal(false);
    } catch { setError("Failed to claim"); }
    setClaiming(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!country) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 48 }}>🏴</p>
        <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Nation not found</p>
        <Link href="/" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>← Back to Map</Link>
      </div>
    );
  }

  const oilPercent = Math.min(100, (country.oil / 1000) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,15,28,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)", padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--gold)" }}>OILD</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>.fun</span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← Back to Map</Link>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "100px 20px 60px" }}>
        {/* Country Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ fontSize: 80, display: "block", marginBottom: 16 }}>{country.emoji}</span>
          <h1 style={{
            fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px",
            color: country.claimed ? "var(--gold)" : "var(--text)",
          }}>
            {country.name}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{country.region} · {country.code}</p>
          {country.claimed && (
            <span style={{
              display: "inline-block", marginTop: 12, padding: "6px 16px", borderRadius: 20,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
              color: "var(--green)", fontSize: 12, fontWeight: 600,
            }}>
              CLAIMED ✓
            </span>
          )}
        </div>

        {/* Oil Reserves */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
          padding: 28, marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Oil Reserves</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--gold)", margin: 0 }}>{country.oil.toLocaleString()} 🛢️</p>
          </div>
          <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 6, width: `${oilPercent}%`,
              background: oilPercent > 60 ? "linear-gradient(90deg, #D4A017, #F59E0B)" : oilPercent > 30 ? "linear-gradient(90deg, #F59E0B, #EF4444)" : "linear-gradient(90deg, #EF4444, #991B1B)",
              transition: "width 0.5s ease",
            }} />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
            {oilPercent > 80 ? "Overflowing with black gold" : oilPercent > 50 ? "Strong reserves" : oilPercent > 20 ? "Running low — vulnerable to raids" : "Nearly dried up"}
          </p>
        </div>

        {/* Claim or Info */}
        {!country.claimed ? (
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
            padding: 28, textAlign: "center", marginBottom: 20,
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>This nation is unclaimed</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px" }}>
              Be the first to plant your flag. Deploy the token on pump.fun and claim {country.name} forever.
            </p>
            <button onClick={() => setShowClaimModal(true)} style={{
              padding: "14px 32px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #D4A017, #B8860B)", color: "white",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(212,160,23,0.3)",
            }}>
              🏴 Claim {country.name}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {/* Token info */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Token Info</p>
              {country.claim?.tokenAddress && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>Token</span>
                  <a href={`https://pump.fun/coin/${country.claim.tokenAddress}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: "var(--gold)", textDecoration: "none", fontFamily: "monospace", fontSize: 12 }}>
                    {country.claim.tokenAddress.slice(0, 6)}...{country.claim.tokenAddress.slice(-4)} ↗
                  </a>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Claimed by</span>
                <span style={{ color: "var(--text)", fontFamily: "monospace", fontSize: 12 }}>
                  {country.claim?.claimedBy.slice(0, 6)}...{country.claim?.claimedBy.slice(-4)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Claimed</span>
                <span style={{ color: "var(--text)" }}>
                  {country.claim ? new Date(country.claim.claimedAt).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>

            {/* X Community */}
            {country.claim?.xCommunity && (
              <a href={country.claim.xCommunity} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
                padding: "16px 24px", textDecoration: "none", transition: "border-color 0.15s",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Join the {country.name} Community</span>
              </a>
            )}

            {/* Raid button */}
            <button style={{
              padding: "14px 24px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.08)", color: "#EF4444",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              ⚔️ Raid {country.name} — Steal Their Oil
            </button>
          </div>
        )}

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/" style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}>← Back to Map</Link>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={() => setShowClaimModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16,
            padding: 32, maxWidth: 440, width: "100%",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>Claim {country.name} {country.emoji}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px" }}>This is permanent — once claimed, it&apos;s yours forever.</p>

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 13, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>{error}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Your Solana Wallet *</label>
                <input value={claimForm.wallet} onChange={e => setClaimForm({ ...claimForm, wallet: e.target.value })}
                  placeholder="Your wallet address"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>pump.fun Token Address</label>
                <input value={claimForm.tokenAddress} onChange={e => setClaimForm({ ...claimForm, tokenAddress: e.target.value })}
                  placeholder="After deploying on pump.fun"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>X Community Link</label>
                <input value={claimForm.xCommunity} onChange={e => setClaimForm({ ...claimForm, xCommunity: e.target.value })}
                  placeholder="https://x.com/..."
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" }} />
              </div>
              <button onClick={handleClaim} disabled={claiming} style={{
                padding: "14px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #D4A017, #B8860B)", color: "white",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                opacity: claiming ? 0.5 : 1,
              }}>
                {claiming ? "Claiming..." : `🏴 Claim ${country.name} Forever`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
