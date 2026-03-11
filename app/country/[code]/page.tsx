"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CountryDetail {
  code: string; numCode: string; name: string; oil: number;
  region: string; claimed: boolean;
  claim: { president: string; tokenAddress: string; xCommunity: string; claimedAt: number; population: number; gdp: number; oilStolen: number; verified: boolean } | null;
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
    if (!claimForm.tokenAddress) { setError("Deploy the token on pump.fun first, then paste the address"); return; }
    setClaiming(true); setError("");
    try {
      const res = await fetch("/api/countries/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, ...claimForm }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setClaiming(false); return; }
      const d = await fetch("/api/countries").then(r => r.json());
      const found = (d.countries || []).find((c: CountryDetail) => c.code === code);
      setCountry(found || null);
      setShowClaimModal(false);
    } catch { setError("Failed to claim"); }
    setClaiming(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#666" }}>Loading...</p>
      </div>
    );
  }

  if (!country) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "#666", fontSize: 16 }}>Nation not found</p>
        <Link href="/" style={{ color: "#D4A017", textDecoration: "none", fontWeight: 600 }}>Back to Map</Link>
      </div>
    );
  }

  const oilDisplay = country.oil >= 1000 ? `${(country.oil / 1000).toFixed(1)}B` : `${country.oil}M`;
  const oilPercent = Math.min(100, (country.oil / 304000) * 100);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
    background: "#0A0A0A", color: "#E8E0D0", fontSize: 13, outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#E8E0D0" }}>
      {/* Nav pill */}
      <nav style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 100,
        background: "rgba(20,20,20,0.9)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999,
        padding: "0 32px", height: 48,
        display: "flex", alignItems: "center", gap: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: "#D4A017", textDecoration: "none", letterSpacing: "0.06em" }}>OILD</Link>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <Link href="/" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>Map</Link>
        <Link href="/leaderboard" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>Leaderboard</Link>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "100px 20px 60px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#D4A017", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>{country.region}</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px", color: country.claimed ? "#D4A017" : "#E8E0D0" }}>
            {country.name}
          </h1>
          <p style={{ fontSize: 13, color: "#555" }}>{country.code}</p>
          {country.claimed && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8 }}>
              <span style={{
                padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E",
              }}>CLAIMED</span>
              {country.claim?.verified && (
                <span style={{
                  padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.2)", color: "#D4A017",
                }}>VERIFIED</span>
              )}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Oil Reserves</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#D4A017", margin: 0 }}>{oilDisplay}</p>
            <p style={{ fontSize: 10, color: "#444", margin: "2px 0 0" }}>barrels</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Population</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#E8E0D0", margin: 0 }}>{country.claim?.population?.toLocaleString() || "--"}</p>
            <p style={{ fontSize: 10, color: "#444", margin: "2px 0 0" }}>holders</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>GDP</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#22C55E", margin: 0 }}>{country.claim?.gdp ? `$${(country.claim.gdp / 1000).toFixed(0)}K` : "--"}</p>
            <p style={{ fontSize: 10, color: "#444", margin: "2px 0 0" }}>market cap</p>
          </div>
        </div>

        {/* Oil reserves bar */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
            <span style={{ color: "#666" }}>Proven Reserves</span>
            <span style={{ color: "#D4A017", fontWeight: 700 }}>{country.oil.toLocaleString()} million bbl</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, width: `${oilPercent}%`,
              background: "linear-gradient(90deg, #D4A017, #F59E0B)",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Claim or Claimed Info */}
        {!country.claimed ? (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 10, padding: 28, textAlign: "center", marginBottom: 16,
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#E8E0D0", margin: "0 0 8px" }}>Unclaimed Territory</p>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 6px", lineHeight: 1.6 }}>
              Deploy {country.name}&apos;s national token on pump.fun with the country name as the ticker.
              Submit the token address below. You become President.
            </p>
            <p style={{ fontSize: 11, color: "#555", margin: "0 0 20px" }}>
              Population = token holders. GDP = market cap.
            </p>
            <button onClick={() => setShowClaimModal(true)} style={{
              padding: "14px 32px", borderRadius: 8, border: "none",
              background: "#D4A017", color: "#0A0A0A",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              Claim {country.name}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>Nation Info</p>
              {[
                ["President", <span key="p" style={{ fontFamily: "monospace", fontSize: 11 }}>{country.claim?.president.slice(0, 6)}...{country.claim?.president.slice(-4)}</span>],
                ["Token", country.claim?.tokenAddress ? <a key="t" href={`https://pump.fun/coin/${country.claim.tokenAddress}`} target="_blank" rel="noopener noreferrer" style={{ color: "#D4A017", textDecoration: "none", fontFamily: "monospace", fontSize: 11 }}>{country.claim.tokenAddress.slice(0, 6)}...{country.claim.tokenAddress.slice(-4)}</a> : "--"],
                ["Claimed", country.claim ? new Date(country.claim.claimedAt).toLocaleDateString() : "--"],
                ["Oil Stolen", `${country.claim?.oilStolen?.toLocaleString() || 0} bbl`],
              ].map(([label, value]) => (
                <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 13 }}>
                  <span style={{ color: "#666" }}>{label}</span>
                  <span style={{ color: "#E8E0D0" }}>{value}</span>
                </div>
              ))}
            </div>

            {country.claim?.xCommunity && (
              <a href={country.claim.xCommunity} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10,
                padding: "14px", textDecoration: "none",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#E8E0D0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E0D0" }}>{country.name} Community on X</span>
              </a>
            )}

            <button style={{
              padding: "14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.05)", color: "#EF4444",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              Declare War on {country.name}
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/" style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>Back to Map</Link>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setShowClaimModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
            padding: 32, maxWidth: 440, width: "100%",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#E8E0D0", margin: "0 0 4px" }}>Claim {country.name}</h2>
            <p style={{ fontSize: 12, color: "#666", margin: "0 0 20px" }}>
              Deploy the token on pump.fun first. Use &quot;{country.name}&quot; as the token name. Then submit here.
            </p>

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 12, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>{error}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "#666", display: "block", marginBottom: 5 }}>Your Solana Wallet (you become President)</label>
                <input value={claimForm.wallet} onChange={e => setClaimForm({ ...claimForm, wallet: e.target.value })}
                  placeholder="Wallet address" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "#666", display: "block", marginBottom: 5 }}>pump.fun Token Address (required)</label>
                <input value={claimForm.tokenAddress} onChange={e => setClaimForm({ ...claimForm, tokenAddress: e.target.value })}
                  placeholder="Token mint address from pump.fun" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "#666", display: "block", marginBottom: 5 }}>X Community Link</label>
                <input value={claimForm.xCommunity} onChange={e => setClaimForm({ ...claimForm, xCommunity: e.target.value })}
                  placeholder="https://x.com/..." style={inputStyle} />
              </div>
              <button onClick={handleClaim} disabled={claiming} style={{
                padding: "14px", borderRadius: 8, border: "none",
                background: "#D4A017", color: "#0A0A0A",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                opacity: claiming ? 0.5 : 1,
              }}>
                {claiming ? "Claiming..." : `Become President of ${country.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
