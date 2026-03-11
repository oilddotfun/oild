"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface CountryData {
  code: string; numCode: string; name: string; oil: number;
  region: string; claimed: boolean;
  claim: { claimedBy: string; tokenAddress: string; xCommunity: string; claimedAt: number } | null;
}

interface GeoFeature {
  type: string;
  id: string;
  properties: { name: string };
  geometry: { type: string; coordinates: number[][][][] | number[][][] };
}

/* ═══════════════════════════════════════════════
   SIMPLE MERCATOR PROJECTION
   ═══════════════════════════════════════════════ */

function projectMercator(lon: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lon + 180) / 360) * w;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = h / 2 - (w * mercN) / (2 * Math.PI);
  return [x, Math.max(0, Math.min(h, y))];
}

function coordsToPath(coords: number[][], w: number, h: number): string {
  return coords.map((pt, i) => {
    const [x, y] = projectMercator(pt[0], pt[1], w, h);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("") + "Z";
}

function geometryToPath(geom: { type: string; coordinates: number[][][][] | number[][][] }, w: number, h: number): string {
  if (geom.type === "Polygon") {
    return (geom.coordinates as number[][][]).map(ring => coordsToPath(ring, w, h)).join("");
  }
  if (geom.type === "MultiPolygon") {
    return (geom.coordinates as number[][][][]).map(poly =>
      poly.map(ring => coordsToPath(ring, w, h)).join("")
    ).join("");
  }
  return "";
}

/* ═══════════════════════════════════════════════
   TOPOJSON DECODER (minimal)
   ═══════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function topoToGeo(topo: any): GeoFeature[] {
  const { arcs: topoArcs, transform } = topo;
  const { scale, translate } = transform;

  // Decode arcs
  const decodedArcs: number[][][] = topoArcs.map((arc: number[][]) => {
    let x = 0, y = 0;
    return arc.map((pt: number[]) => {
      x += pt[0]; y += pt[1];
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });

  function decodeRing(indices: number[]): number[][] {
    const coords: number[][] = [];
    for (const idx of indices) {
      const arc = idx >= 0 ? decodedArcs[idx] : [...decodedArcs[~idx]].reverse();
      for (let i = 0; i < arc.length; i++) {
        if (i === 0 && coords.length > 0) continue; // skip duplicate join point
        coords.push(arc[i]);
      }
    }
    return coords;
  }

  const geoms = topo.objects.countries.geometries;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return geoms.map((g: any) => {
    let coordinates;
    if (g.type === "Polygon") {
      coordinates = g.arcs.map((ring: number[]) => decodeRing(ring));
    } else if (g.type === "MultiPolygon") {
      coordinates = g.arcs.map((poly: number[][]) =>
        poly.map((ring: number[]) => decodeRing(ring))
      );
    }
    return {
      type: "Feature",
      id: g.id,
      properties: g.properties || { name: "" },
      geometry: { type: g.type, coordinates },
    };
  });
}

/* ═══════════════════════════════════════════════
   TICKER
   ═══════════════════════════════════════════════ */

function Ticker({ countries }: { countries: CountryData[] }) {
  const claimed = countries.filter(c => c.claimed);
  if (claimed.length === 0) {
    return (
      <div style={{
        background: "rgba(212,160,23,0.06)", borderBottom: "1px solid rgba(212,160,23,0.15)",
        padding: "8px 0", overflow: "hidden", whiteSpace: "nowrap", fontSize: 13, color: "#D4A017",
      }}>
        <div style={{ display: "inline-block", animation: "scroll-left 30s linear infinite" }}>
          <span style={{ padding: "0 40px" }}>OIL WARS LIVE -- Claim a nation to start the battle -- Deploy on pump.fun -- Conquer the global oil supply</span>
          <span style={{ padding: "0 40px" }}>OIL WARS LIVE -- Claim a nation to start the battle -- Deploy on pump.fun -- Conquer the global oil supply</span>
          <span style={{ padding: "0 40px" }}>OIL WARS LIVE -- Claim a nation to start the battle -- Deploy on pump.fun -- Conquer the global oil supply</span>
        </div>
        <style>{`@keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }`}</style>
      </div>
    );
  }
  return (
    <div style={{
      background: "rgba(212,160,23,0.06)", borderBottom: "1px solid rgba(212,160,23,0.15)",
      padding: "8px 0", overflow: "hidden", whiteSpace: "nowrap", fontSize: 13, color: "#D4A017",
    }}>
      <div style={{ display: "inline-block", animation: "scroll-left 30s linear infinite" }}>
        {[0,1,2].map(rep => (
          <span key={rep} style={{ padding: "0 40px" }}>
            {claimed.map(c => `${c.name} CLAIMED`).join(" -- ")} -- OIL WARS LIVE
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function Home() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ totalClaimed: 0, totalOil: 0, totalCountries: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const W = 960, H = 500;

  // Fetch countries from API
  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => {
      setCountries(d.countries || []);
      setStats({ totalClaimed: d.totalClaimed, totalOil: d.totalOil, totalCountries: d.totalCountries });
    }).catch(() => {});
  }, []);

  // Fetch TopoJSON map
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(topo => {
        const geoFeatures = topoToGeo(topo);
        setFeatures(geoFeatures);
      })
      .catch(err => console.error("Map load failed:", err));
  }, []);

  // Build numCode→country lookup
  const countryByNum = new Map(countries.map(c => [c.numCode, c]));

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

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
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#map" style={{ fontSize: 13, color: "#999", textDecoration: "none", fontWeight: 500 }}>Map</a>
          <Link href="/leaderboard" style={{ fontSize: 13, color: "#999", textDecoration: "none", fontWeight: 500 }}>Leaderboard</Link>
          <a href="#how" style={{ fontSize: 13, color: "#999", textDecoration: "none", fontWeight: 500 }}>How it Works</a>
          <button style={{
            padding: "8px 20px", borderRadius: 6, border: "none",
            background: "#D4A017", color: "#0A0A0A", fontSize: 12, fontWeight: 700, cursor: "pointer",
            letterSpacing: "0.02em",
          }}>
            Leaderboard
          </button>
        </div>
      </nav>

      {/* Ticker */}
      <div style={{ paddingTop: 56 }}>
        <Ticker countries={countries} />
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "12px 20px", fontSize: 13 }}>
        <span style={{ color: "#666" }}>{stats.totalClaimed} Claimed</span>
        <span style={{ color: "#666" }}>|</span>
        <span style={{ color: "#666" }}>{(stats.totalOil / 1000).toFixed(0)}B Barrels</span>
      </div>

      {/* Map */}
      <section id="map" ref={mapRef} onMouseMove={handleMouseMove}
        style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "0 16px", scrollMarginTop: 80 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Background */}
          <rect width={W} height={H} fill="#0A0A0A" />

          {/* Country shapes */}
          {features.map(f => {
            const cData = countryByNum.get(f.id);
            const isClaimed = cData?.claimed || false;
            const isHovered = hovered === f.id;
            const path = geometryToPath(f.geometry, W, H);
            if (!path) return null;
            return (
              <path
                key={f.id}
                d={path}
                fill={isClaimed ? "#D4A017" : isHovered ? "#C4A882" : "#B8A88A"}
                stroke={isHovered ? "#D4A017" : "#8B7355"}
                strokeWidth={isHovered ? 1.2 : 0.5}
                style={{ cursor: "pointer", transition: "fill 0.15s" }}
                onMouseEnter={() => {
                  setHovered(f.id);
                  setHoveredInfo(cData || null);
                }}
                onMouseLeave={() => { setHovered(null); setHoveredInfo(null); }}
                onClick={() => {
                  if (cData) window.location.href = `/country/${cData.code}`;
                }}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredInfo && (
          <div style={{
            position: "absolute", left: mousePos.x + 16, top: mousePos.y - 10,
            background: "rgba(10,10,10,0.95)", border: "1px solid rgba(212,160,23,0.3)",
            borderRadius: 8, padding: "10px 14px", zIndex: 100,
            pointerEvents: "none", minWidth: 200,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#E8E0D0", margin: "0 0 6px" }}>{hoveredInfo.name}</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#888" }}>Oil Reserves</span>
              <span style={{ fontWeight: 700, color: "#D4A017" }}>{(hoveredInfo.oil / 1000).toFixed(1)}B barrels</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#888" }}>Status</span>
              <span style={{ fontWeight: 600, color: hoveredInfo.claimed ? "#22C55E" : "#888" }}>
                {hoveredInfo.claimed ? "Claimed" : "Unclaimed"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* How it Works */}
      <section id="how" style={{ maxWidth: 800, margin: "60px auto 80px", padding: "0 20px", scrollMarginTop: 80 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#E8E0D0", textAlign: "center", marginBottom: 32 }}>
          How It Works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { step: "1", title: "Claim a Nation", desc: "Pick an unclaimed country. Deploy its token on pump.fun. You own it forever." },
            { step: "2", title: "Drill for Oil", desc: "Your nation produces oil barrels. More holders, more drilling power." },
            { step: "3", title: "Raid Enemies", desc: "Attack other nations to steal their oil reserves. Bigger army wins." },
            { step: "4", title: "Dominate", desc: "Control the global oil supply. Become the superpower." },
          ].map(s => (
            <div key={s.step} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: 24,
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#D4A017", marginBottom: 8, display: "block" }}>STEP {s.step}</span>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#E8E0D0", margin: "0 0 8px" }}>{s.title}</p>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#555" }}>OILD.fun -- The on-chain oil war. Built on Solana.</p>
      </footer>
    </div>
  );
}
