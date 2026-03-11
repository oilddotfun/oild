"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CountryData {
  code: string; name: string; oil: number;
  region: string; claimed: boolean;
  claim: { claimedBy: string; tokenAddress: string; xCommunity: string; claimedAt: number } | null;
}

export default function Leaderboard() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [filter, setFilter] = useState<"all" | "claimed" | "unclaimed">("all");

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => {
      setCountries((d.countries || []).sort((a: CountryData, b: CountryData) => b.oil - a.oil));
    }).catch(() => {});
  }, []);

  const filtered = countries.filter(c => {
    if (filter === "claimed") return c.claimed;
    if (filter === "unclaimed") return !c.claimed;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#E8E0D0" }}>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: "#D4A017", textDecoration: "none", letterSpacing: "0.05em" }}>OILD</Link>
        <Link href="/" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Back to Map</Link>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#E8E0D0", textAlign: "center", marginBottom: 8 }}>
          Global Oil Leaderboard
        </h1>
        <p style={{ fontSize: 13, color: "#666", textAlign: "center", marginBottom: 32 }}>
          {filtered.length} nations ranked by proven oil reserves
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {(["all", "claimed", "unclaimed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 18px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${filter === f ? "#D4A017" : "rgba(255,255,255,0.08)"}`,
              background: filter === f ? "rgba(212,160,23,0.1)" : "transparent",
              color: filter === f ? "#D4A017" : "#666",
              textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>

        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 80px",
          padding: "8px 20px", fontSize: 10, fontWeight: 600, color: "#555",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          <span>#</span>
          <span>Nation</span>
          <span style={{ textAlign: "right" }}>Oil Reserves</span>
          <span style={{ textAlign: "right" }}>Region</span>
          <span style={{ textAlign: "right" }}>Status</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((c, i) => (
            <Link key={c.code} href={`/country/${c.code}`} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 80px",
              alignItems: "center", padding: "12px 20px", borderRadius: 8,
              background: i < 3 ? "rgba(212,160,23,0.03)" : "transparent",
              textDecoration: "none", transition: "background 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = i < 3 ? "rgba(212,160,23,0.03)" : "transparent"; }}
            >
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#555",
              }}>{i + 1}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#E8E0D0" }}>{c.name}</span>
              <span style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: "#D4A017" }}>
                {(c.oil / 1000).toFixed(1)}B bbl
              </span>
              <span style={{ textAlign: "right", fontSize: 12, color: "#666" }}>{c.region}</span>
              <span style={{
                textAlign: "right", fontSize: 10, fontWeight: 600,
                color: c.claimed ? "#22C55E" : "#555",
              }}>
                {c.claimed ? "CLAIMED" : "OPEN"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
