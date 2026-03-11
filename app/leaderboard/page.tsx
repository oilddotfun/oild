"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CountryData {
  code: string; numCode: string; name: string; oil: number;
  region: string; claimed: boolean;
  claim: { president: string; tokenAddress: string; population: number; gdp: number; xCommunity: string } | null;
}

/* Mini silhouette for each country — fetches from TopoJSON and renders tiny SVG */
function CountrySilhouette({ numCode, size = 36 }: { numCode: string; size?: number }) {
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    // Cache TopoJSON globally
    const cacheKey = "__oild_topo";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const load = async () => {
      if (!win[cacheKey]) {
        win[cacheKey] = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(r => r.json());
      }
      const topo = await win[cacheKey];
      const { arcs: rawArcs, transform } = topo;
      const { scale, translate } = transform;

      const decoded: number[][][] = rawArcs.map((arc: number[][]) => {
        let px = 0, py = 0;
        return arc.map((d: number[]) => { px += d[0]; py += d[1]; return [px * scale[0] + translate[0], py * scale[1] + translate[1]]; });
      });

      const geom = topo.objects.countries.geometries.find((g: { id: string }) => g.id === numCode);
      if (!geom) return;

      // Decode rings
      const allCoords: number[][] = [];
      const decodeRing = (indices: number[]): number[][] => {
        const coords: number[][] = [];
        for (const idx of indices) {
          const fwd = idx >= 0;
          const arc = fwd ? decoded[idx] : [...decoded[~idx]].reverse();
          if (!arc) continue;
          for (let i = 0; i < arc.length; i++) { if (coords.length > 0 && i === 0) continue; coords.push(arc[i]); }
        }
        return coords;
      };

      const rings: number[][][] = [];
      if (geom.type === "Polygon") {
        geom.arcs.forEach((r: number[]) => { const ring = decodeRing(r); rings.push(ring); allCoords.push(...ring); });
      } else if (geom.type === "MultiPolygon") {
        geom.arcs.forEach((p: number[][]) => p.forEach((r: number[]) => { const ring = decodeRing(r); rings.push(ring); allCoords.push(...ring); }));
      }

      if (allCoords.length === 0) return;

      // Bounding box
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const [lon, lat] of allCoords) {
        if (lon < minX) minX = lon;
        if (lon > maxX) maxX = lon;
        if (lat < minY) minY = lat;
        if (lat > maxY) maxY = lat;
      }
      const rangeX = maxX - minX || 1;
      const rangeY = maxY - minY || 1;
      const s = size * 0.85;

      // Generate SVG path normalized to bounding box
      let svgPath = "";
      for (const ring of rings) {
        for (let i = 0; i < ring.length; i++) {
          const x = ((ring[i][0] - minX) / rangeX) * s + (size - s) / 2;
          const y = s - ((ring[i][1] - minY) / rangeY) * s + (size - s) / 2;
          svgPath += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`;
        }
        svgPath += "Z";
      }
      setPath(svgPath);
    };
    load();
  }, [numCode, size]);

  if (!path) {
    return <div style={{ width: size, height: size, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={path} fill="#B8A88A" stroke="#8B7355" strokeWidth={0.5} />
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
        <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: "#D4A017", textDecoration: "none", letterSpacing: "0.06em" }}>OILD</Link>
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
