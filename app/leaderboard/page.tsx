"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { geoPath, geoMercator } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";

interface CountryData {
  code: string; numCode: string; name: string; oil: number;
  region: string; claimed: boolean;
  claim: { president: string; tokenAddress: string; population: number; gdp: number; xCommunity: string } | null;
}

/* ══════════════ COUNTRY SILHOUETTE ══════════════ */

// Global cache for features
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedFeatures: any[] | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loadingPromise: Promise<any[]> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadFeatures(): Promise<any[]> {
  if (cachedFeatures) return Promise.resolve(cachedFeatures);
  if (loadingPromise) return loadingPromise;
  loadingPromise = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(r => r.json())
    .then((topo: Topology) => {
      const geojson = feature(topo, topo.objects.countries as GeometryCollection);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cachedFeatures = (geojson as any).features;
      return cachedFeatures!;
    });
  return loadingPromise;
}

function CountrySilhouette({ numCode, size = 36 }: { numCode: string; size?: number }) {
  const [svgPath, setSvgPath] = useState<string>("");

  useEffect(() => {
    loadFeatures().then(feats => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const feat = feats.find((f: any) => String(f.id) === numCode);
      if (!feat) return;

      // Use d3-geo to compute bounds, then fit projection to our size
      const padding = 2;
      const proj = geoMercator().fitExtent(
        [[padding, padding], [size - padding, size - padding]],
        feat as GeoPermissibleObjects
      );
      const gen = geoPath().projection(proj);
      const d = gen(feat as GeoPermissibleObjects);
      if (d) setSvgPath(d);
    });
  }, [numCode, size]);

  if (!svgPath) {
    return <div style={{ width: size, height: size, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={svgPath} fill="#E8943A" stroke="#0A0A0A" strokeWidth={0.5} strokeLinejoin="round" />
    </svg>
  );
}

/* ══════════════ LEADERBOARD ══════════════ */

type SortKey = "oil" | "population" | "gdp";

export default function Leaderboard() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [filter, setFilter] = useState<"all" | "claimed" | "unclaimed">("all");
  const [sortBy, setSortBy] = useState<SortKey>("oil");

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => {
      setCountries(d.countries || []);
    }).catch(() => {});
  }, []);

  const sorted = [...countries]
    .filter(c => {
      if (filter === "claimed") return c.claimed;
      if (filter === "unclaimed") return !c.claimed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oil") return b.oil - a.oil;
      if (sortBy === "population") return (b.claim?.population || 0) - (a.claim?.population || 0);
      if (sortBy === "gdp") return (b.claim?.gdp || 0) - (a.claim?.gdp || 0);
      return 0;
    });

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
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo.jpg" alt="OILD" style={{ height: 28, borderRadius: 4 }} />
        </Link>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <Link href="/" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>Map</Link>
        <span style={{ fontSize: 12, color: "#D4A017", fontWeight: 600 }}>Leaderboard</span>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 20px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#E8E0D0", textAlign: "center", marginBottom: 8 }}>
          Global Leaderboard
        </h1>
        <p style={{ fontSize: 13, color: "#666", textAlign: "center", marginBottom: 24 }}>
          {sorted.length} nations -- ranked by {sortBy === "oil" ? "oil reserves" : sortBy === "population" ? "population (holders)" : "GDP (market cap)"}
        </p>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {(["all", "claimed", "unclaimed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${filter === f ? "#D4A017" : "rgba(255,255,255,0.08)"}`,
              background: filter === f ? "rgba(212,160,23,0.1)" : "transparent",
              color: filter === f ? "#D4A017" : "#666", textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
          {([["oil", "Oil Reserves"], ["population", "Population"], ["gdp", "GDP"]] as [SortKey, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)} style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: "none",
              background: sortBy === key ? "rgba(212,160,23,0.15)" : "rgba(255,255,255,0.03)",
              color: sortBy === key ? "#D4A017" : "#666",
            }}>{label}</button>
          ))}
        </div>

        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "36px 44px 1fr 110px 90px 90px 70px",
          padding: "8px 16px", fontSize: 10, fontWeight: 600, color: "#444",
          textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <span>#</span>
          <span></span>
          <span>Nation</span>
          <span style={{ textAlign: "right" }}>Oil Reserves</span>
          <span style={{ textAlign: "right" }}>Population</span>
          <span style={{ textAlign: "right" }}>GDP</span>
          <span style={{ textAlign: "right" }}>Status</span>
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {sorted.map((c, i) => (
            <Link key={c.code} href={`/country/${c.code}`} style={{
              display: "grid", gridTemplateColumns: "36px 44px 1fr 110px 90px 90px 70px",
              alignItems: "center", padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.03)",
              textDecoration: "none", transition: "background 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{
                fontSize: 12, fontWeight: 800,
                color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#444",
              }}>{i + 1}</span>
              <CountrySilhouette numCode={c.numCode} size={32} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E0D0" }}>{c.name}</span>
                {c.claimed && c.claim && (
                  <span style={{ display: "block", fontSize: 10, color: "#666", fontFamily: "monospace" }}>
                    Pres: {c.claim.president.slice(0, 4)}...{c.claim.president.slice(-4)}
                  </span>
                )}
              </div>
              <span style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: "#D4A017" }}>
                {c.oil >= 1000 ? `${(c.oil / 1000).toFixed(1)}B` : `${c.oil}M`}
              </span>
              <span style={{ textAlign: "right", fontSize: 12, color: c.claim?.population ? "#E8E0D0" : "#333" }}>
                {c.claim?.population ? c.claim.population.toLocaleString() : "--"}
              </span>
              <span style={{ textAlign: "right", fontSize: 12, color: c.claim?.gdp ? "#22C55E" : "#333" }}>
                {c.claim?.gdp ? `$${(c.claim.gdp / 1000).toFixed(0)}K` : "--"}
              </span>
              <span style={{
                textAlign: "right", fontSize: 10, fontWeight: 600,
                color: c.claimed ? "#22C55E" : "#333",
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
