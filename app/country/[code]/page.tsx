"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CountryDetail {
  code: string; numCode: string; name: string; oil: number;
  region: string; claimed: boolean;
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

  const oilBillions = (country.oil / 1000).toFixed(1);
  const oilPercent = Math.min(100, (country.oil / 304000) * 100); // 304B = Venezuela max

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
    background: "#0A0A0A", color: "#E8E0D0", fontSize: 13, outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#E8E0D0" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: "#D4A017", textDecoration: "none", letterSpacing: "0.05em" }}>
          OILD
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Back to Map</Link>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "100px 20px 60px" }}>
        {/* Country Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#D4A017", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>{country.region}</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px", color: country.claimed ? "#D4A017" : "#E8E0D0" }}>
            {country.name}
          </h1>
          <p style={{ fontSize: 14, color: "#666" }}>{country.code}</p>
          {country.claimed && (
            <span style={{
              display: "inline-block", marginTop: 12, padding: "6px 16px", borderRadius: 20,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
              color: "#22C55E", fontSize: 12, fontWeight: 600,
            }}>
              CLAIMED
            </span>
          )}
        </div>

        {/* Oil Reserves */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: 28, marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#999", margin: 0 }}>Proven Oil Reserves</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#D4A017", margin: 0 }}>{oilBillions}B bbl</p>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 5, width: `${oilPercent}%`,
              background: oilPercent > 50 ? "linear-gradient(90deg, #D4A017, #F59E0B)" : oilPercent > 20 ? "linear-gradient(90deg, #F59E0B, #EF4444)" : "#EF4444",
              transition: "width 0.5s ease",
            }} />
          </div>
          <p style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
            {country.oil.toLocaleString()} million barrels (EIA/OPEC data)
          </p>
        </div>

        {/* Claim or Info */}
        {!country.claimed ? (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: 28, textAlign: "center", marginBottom: 16,
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#E8E0D0", margin: "0 0 8px" }}>This nation is unclaimed</p>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px" }}>
              Deploy the token on pump.fun and claim {country.name} forever.
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Token Info</p>
              {country.claim?.tokenAddress && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: "#888" }}>Token</span>
                  <a href={`https://pump.fun/coin/${country.claim.tokenAddress}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: "#D4A017", textDecoration: "none", fontFamily: "monospace", fontSize: 12 }}>
                    {country.claim.tokenAddress.slice(0, 6)}...{country.claim.tokenAddress.slice(-4)}
                  </a>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "#888" }}>Claimed by</span>
                <span style={{ color: "#E8E0D0", fontFamily: "monospace", fontSize: 12 }}>
                  {country.claim?.claimedBy.slice(0, 6)}...{country.claim?.claimedBy.slice(-4)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#888" }}>Claimed</span>
                <span style={{ color: "#E8E0D0" }}>
                  {country.claim ? new Date(country.claim.claimedAt).toLocaleDateString() : "--"}
                </span>
              </div>
            </div>

            {country.claim?.xCommunity && (
              <a href={country.claim.xCommunity} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
                padding: "14px 24px", textDecoration: "none",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#E8E0D0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E0D0" }}>Join the {country.name} Community</span>
              </a>
            )}

            <button style={{
              padding: "14px 24px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.06)", color: "#EF4444",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              Raid {country.name} -- Steal Their Oil
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Back to Map</Link>
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
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#E8E0D0", margin: "0 0 4px" }}>Claim {country.name}</h2>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px" }}>Permanent. Once claimed, this nation is yours forever.</p>

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 13, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>{error}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#888", display: "block", marginBottom: 6 }}>Your Solana Wallet *</label>
                <input value={claimForm.wallet} onChange={e => setClaimForm({ ...claimForm, wallet: e.target.value })}
                  placeholder="Wallet address" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#888", display: "block", marginBottom: 6 }}>pump.fun Token Address</label>
                <input value={claimForm.tokenAddress} onChange={e => setClaimForm({ ...claimForm, tokenAddress: e.target.value })}
                  placeholder="After deploying on pump.fun" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#888", display: "block", marginBottom: 6 }}>X Community Link</label>
                <input value={claimForm.xCommunity} onChange={e => setClaimForm({ ...claimForm, xCommunity: e.target.value })}
                  placeholder="https://x.com/..." style={inputStyle} />
              </div>
              <button onClick={handleClaim} disabled={claiming} style={{
                padding: "14px", borderRadius: 8, border: "none",
                background: "#D4A017", color: "#0A0A0A",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                opacity: claiming ? 0.5 : 1,
              }}>
                {claiming ? "Claiming..." : `Claim ${country.name} Forever`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
