"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CountryData {
  code: string; name: string; emoji: string; oil: number;
  region: string; x: number; y: number;
  claimed: boolean; claim: { claimedBy: string; tokenAddress: string; xCommunity: string; claimedAt: number } | null;
}

export default function Home() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [hovered, setHovered] = useState<CountryData | null>(null);
  const [stats, setStats] = useState({ totalClaimed: 0, totalOil: 0, totalCountries: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => {
      setCountries(d.countries || []);
      setStats({ totalClaimed: d.totalClaimed, totalOil: d.totalOil, totalCountries: d.totalCountries });
    }).catch(() => {});
  }, []);

  const topByOil = [...countries].sort((a, b) => b.oil - a.oil).slice(0, 10);

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
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--gold)", letterSpacing: "-0.02em" }}>OILD</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>.fun</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/leaderboard" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>Leaderboard</Link>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>X</a>
          <button style={{
            padding: "8px 20px", borderRadius: 8, border: "1px solid var(--gold)",
            background: "var(--gold-dim)", color: "var(--gold)", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 40, textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>
          <div style={{
            display: "inline-block", padding: "4px 14px", borderRadius: 20,
            background: "var(--gold-dim)", border: "1px solid rgba(212,160,23,0.2)",
            fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 20,
          }}>
            BUILT ON SOLANA
          </div>
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16,
            background: "linear-gradient(135deg, #D4A017, #F59E0B, #D4A017)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Claim Nations.<br/>Drill Oil.<br/>Conquer the Map.
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 32px" }}>
            Every country is a token. Every barrel is a weapon. Deploy on pump.fun, raid your enemies, dominate the global oil supply.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#map" style={{
              padding: "14px 32px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #D4A017, #B8860B)", color: "white",
              fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none",
              boxShadow: "0 4px 20px rgba(212,160,23,0.3)",
            }}>
              Explore the Map
            </a>
            <Link href="/leaderboard" style={{
              padding: "14px 32px", borderRadius: 10,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text)", fontSize: 15, fontWeight: 600, textDecoration: "none",
            }}>
              Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 700, margin: "0 auto 40px", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Nations", value: `${stats.totalClaimed}/${stats.totalCountries}`, sub: "claimed" },
            { label: "Oil Reserves", value: stats.totalOil.toLocaleString(), sub: "barrels" },
            { label: "Players", value: String(stats.totalClaimed), sub: "active" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "20px 16px", textAlign: "center",
            }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "var(--gold)", margin: "0 0 4px" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section id="map" style={{ maxWidth: 1100, margin: "0 auto 60px", padding: "0 20px", scrollMarginTop: 80 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 24 }}>
          🛢️ Global Oil Map
        </h2>
        <div style={{
          position: "relative", width: "100%", paddingBottom: "50%",
          background: "var(--bg-2)", borderRadius: 16, border: "1px solid var(--border)",
          overflow: "hidden",
        }}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
        >
          {/* Grid lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }} viewBox="0 0 100 50" preserveAspectRatio="none">
            {Array.from({ length: 10 }).map((_, i) => <line key={`v${i}`} x1={i * 10} y1={0} x2={i * 10} y2={50} stroke="white" strokeWidth="0.2" />)}
            {Array.from({ length: 5 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="white" strokeWidth="0.2" />)}
          </svg>

          {/* Country dots */}
          {countries.map(c => (
            <Link key={c.code} href={`/country/${c.code}`}
              onMouseEnter={() => setHovered(c)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "absolute",
                left: `${c.x}%`, top: `${c.y}%`,
                transform: "translate(-50%, -50%)",
                width: Math.max(12, Math.min(28, c.oil / 40)),
                height: Math.max(12, Math.min(28, c.oil / 40)),
                borderRadius: "50%",
                background: c.claimed
                  ? "radial-gradient(circle, #D4A017, #B8860B)"
                  : "radial-gradient(circle, #3B4252, #2E3440)",
                border: c.claimed ? "2px solid rgba(212,160,23,0.6)" : "2px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                zIndex: hovered?.code === c.code ? 50 : 10,
                transition: "all 0.2s ease",
                boxShadow: c.claimed ? "0 0 12px rgba(212,160,23,0.4)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{ fontSize: Math.max(8, Math.min(14, c.oil / 60)), lineHeight: 1 }}>{c.emoji}</span>
            </Link>
          ))}

          {/* Hover tooltip */}
          {hovered && (
            <div style={{
              position: "absolute", left: mousePos.x + 16, top: mousePos.y - 10,
              background: "rgba(10,15,28,0.95)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "12px 16px", zIndex: 100,
              pointerEvents: "none", minWidth: 180,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{hovered.emoji}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>{hovered.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{hovered.region}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--text-muted)" }}>Oil Reserves</span>
                <span style={{ fontWeight: 700, color: "var(--gold)" }}>{hovered.oil.toLocaleString()} 🛢️</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                <span style={{ color: "var(--text-muted)" }}>Status</span>
                <span style={{ fontWeight: 600, color: hovered.claimed ? "var(--green)" : "var(--text-muted)" }}>
                  {hovered.claimed ? "Claimed ✓" : "Unclaimed"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top Oil Nations */}
      <section style={{ maxWidth: 800, margin: "0 auto 80px", padding: "0 20px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 24 }}>
          Top Oil Nations
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {topByOil.map((c, i) => (
            <Link key={c.code} href={`/country/${c.code}`} style={{
              display: "flex", alignItems: "center", gap: 16,
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "16px 20px", textDecoration: "none",
              transition: "border-color 0.15s",
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 6,
                background: i < 3 ? "var(--gold-dim)" : "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, color: i < 3 ? "var(--gold)" : "var(--text-muted)",
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 22 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{c.name}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{c.region}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "var(--gold)", margin: 0 }}>{c.oil.toLocaleString()}</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>barrels</p>
              </div>
              <span style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: c.claimed ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                color: c.claimed ? "var(--green)" : "var(--text-muted)",
              }}>
                {c.claimed ? "CLAIMED" : "OPEN"}
              </span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/leaderboard" style={{ fontSize: 14, color: "var(--gold)", fontWeight: 600, textDecoration: "none" }}>
            View Full Leaderboard →
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ maxWidth: 800, margin: "0 auto 80px", padding: "0 20px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 32 }}>
          How It Works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { step: "1", title: "Claim a Nation", desc: "Pick an unclaimed country. Deploy its token on pump.fun. You own it forever.", icon: "🏴" },
            { step: "2", title: "Drill for Oil", desc: "Your nation produces oil barrels. More holders = more drilling power.", icon: "🛢️" },
            { step: "3", title: "Raid Enemies", desc: "Attack other nations to steal their oil. Bigger army wins.", icon: "⚔️" },
            { step: "4", title: "Dominate", desc: "Control the most oil on the map. Become the global superpower.", icon: "👑" },
          ].map(s => (
            <div key={s.step} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
              padding: 24, textAlign: "center",
            }}>
              <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>{s.icon}</span>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>{s.title}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>OILD.fun — The on-chain oil war. Built on Solana.</p>
      </footer>
    </div>
  );
}
