"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CountryData {
  code: string; name: string; emoji: string; oil: number;
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

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 60px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", textAlign: "center", marginBottom: 8 }}>
          🏆 Global Oil Leaderboard
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", marginBottom: 32 }}>
          {filtered.length} nations ranked by oil reserves
        </p>

        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {(["all", "claimed", "unclaimed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${filter === f ? "var(--gold)" : "var(--border)"}`,
              background: filter === f ? "var(--gold-dim)" : "transparent",
              color: filter === f ? "var(--gold)" : "var(--text-muted)",
              textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>

        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 80px",
          padding: "10px 20px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          <span>#</span>
          <span>Nation</span>
          <span style={{ textAlign: "right" }}>Oil Reserves</span>
          <span style={{ textAlign: "right" }}>Region</span>
          <span style={{ textAlign: "right" }}>Status</span>
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((c, i) => (
            <Link key={c.code} href={`/country/${c.code}`} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 80px",
              alignItems: "center", padding: "14px 20px", borderRadius: 10,
              background: i < 3 ? "rgba(212,160,23,0.04)" : "transparent",
              border: "1px solid transparent",
              textDecoration: "none", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = i < 3 ? "rgba(212,160,23,0.04)" : "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
            >
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "var(--text-muted)",
              }}>{i + 1}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{c.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{c.name}</span>
              </div>
              <span style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>
                {c.oil.toLocaleString()} 🛢️
              </span>
              <span style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>{c.region}</span>
              <span style={{
                textAlign: "right", fontSize: 10, fontWeight: 600,
                color: c.claimed ? "var(--green)" : "var(--text-muted)",
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
