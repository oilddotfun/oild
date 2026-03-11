"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

/* ══════════════ TYPES ══════════════ */

interface CountryData {
  code: string; numCode: string; name: string; oil: number;
  region: string; claimed: boolean;
  claim: { president: string; tokenAddress: string; population: number; gdp: number } | null;
}

interface GeoFeature {
  type: string;
  id: string;
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

/* ══════════════ PROJECTION (Mercator, clamped) ══════════════ */

const MAP_W = 960;
const MAP_H = 500;
const LAT_MAX = 83.5;
const LAT_MIN = -56;

function toMerc(lon: number, lat: number): [number, number] {
  const cLat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  const x = ((lon + 180) / 360) * MAP_W;
  const rad = (cLat * Math.PI) / 180;
  const topRad = (LAT_MAX * Math.PI) / 180;
  const botRad = (LAT_MIN * Math.PI) / 180;
  const mercY = Math.log(Math.tan(Math.PI / 4 + rad / 2));
  const mercTop = Math.log(Math.tan(Math.PI / 4 + topRad / 2));
  const mercBot = Math.log(Math.tan(Math.PI / 4 + botRad / 2));
  const y = ((mercTop - mercY) / (mercTop - mercBot)) * MAP_H;
  return [x, y];
}

function ringToPath(coords: number[][]): string {
  if (coords.length < 3) return "";
  const parts: string[] = [];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = toMerc(coords[i][0], coords[i][1]);
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return parts.join("") + "Z";
}

function featureToPath(f: GeoFeature): string {
  const g = f.geometry;
  if (g.type === "Polygon") {
    return (g.coordinates as number[][][]).map(ring => ringToPath(ring)).join("");
  }
  if (g.type === "MultiPolygon") {
    return (g.coordinates as number[][][][])
      .map(poly => poly.map(ring => ringToPath(ring)).join(""))
      .join("");
  }
  return "";
}

/* ══════════════ MAIN PAGE ══════════════ */

export default function Home() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Load country data from API
  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => setCountries(d.countries || [])).catch(() => {});
  }, []);

  // Load TopoJSON and convert properly using topojson-client
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((topo: Topology) => {
        const geojson = feature(topo, topo.objects.countries as GeometryCollection);
        const feats = (geojson as unknown as { features: GeoFeature[] }).features
          // Filter out Antarctica
          .filter((f: GeoFeature) => f.id !== "010");
        setFeatures(feats);
      })
      .catch(err => console.error("Map load error:", err));
  }, []);

  const countryByNum = new Map(countries.map(c => [c.numCode, c]));

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  return (
    <div style={{ height: "100vh", background: "#0A0A0A", color: "#E8E0D0", overflow: "hidden" }}>

      {/* NAV — oval pill, floats over map */}
      <nav style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 100,
        background: "rgba(20,20,20,0.85)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999,
        padding: "0 32px", height: 48,
        display: "flex", alignItems: "center", gap: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: "#D4A017", textDecoration: "none", letterSpacing: "0.06em" }}>OILD</Link>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <a href="#how" style={{ fontSize: 12, color: "#888", textDecoration: "none", fontWeight: 500 }}>How it Works</a>
        <Link href="/leaderboard" style={{
          padding: "7px 18px", borderRadius: 999, border: "none", display: "inline-block",
          background: "#D4A017", color: "#0A0A0A", fontSize: 11, fontWeight: 700, cursor: "pointer",
          textDecoration: "none",
        }}>
          Leaderboard
        </Link>
      </nav>

      {/* MAP — fullscreen, IS the page */}
      <section ref={mapRef} onMouseMove={handleMouseMove}
        style={{ position: "relative", width: "100%", height: "100vh" }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <rect width={MAP_W} height={MAP_H} fill="#0A0A0A" />

          {features.map(f => {
            const id = String(f.id);
            const cData = countryByNum.get(id);
            const isClaimed = cData?.claimed || false;
            const isHov = hovered === id;
            const path = featureToPath(f);
            if (!path) return null;

            let fill = "#3D3A33";
            if (cData) fill = isClaimed ? "#F59E0B" : "#E8943A";
            if (isHov) fill = isClaimed ? "#FBBF24" : "#F0A94E";

            return (
              <path
                key={id}
                d={path}
                fill={fill}
                stroke="#1A1A18"
                strokeWidth={isHov ? 0.8 : 0.3}
                strokeLinejoin="round"
                style={{ cursor: cData ? "pointer" : "default", transition: "fill 0.12s" }}
                onMouseEnter={() => { setHovered(id); setHoveredCountry(cData || null); }}
                onMouseLeave={() => { setHovered(null); setHoveredCountry(null); }}
                onClick={() => { if (cData) window.location.href = `/country/${cData.code}`; }}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredCountry && (
          <div style={{
            position: "absolute",
            left: Math.min(mousePos.x + 16, (mapRef.current?.clientWidth || 900) - 260),
            top: mousePos.y - 10,
            background: "rgba(10,10,10,0.95)", border: "1px solid rgba(212,160,23,0.25)",
            borderRadius: 10, padding: "12px 16px", zIndex: 50,
            pointerEvents: "none", minWidth: 220,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#E8E0D0" }}>{hoveredCountry.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                background: hoveredCountry.claimed ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                color: hoveredCountry.claimed ? "#22C55E" : "#666",
              }}>{hoveredCountry.claimed ? "CLAIMED" : "OPEN"}</span>
            </div>
            <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Oil Reserves</span>
                <span style={{ fontWeight: 700, color: "#D4A017" }}>
                  {hoveredCountry.oil >= 1000 ? `${(hoveredCountry.oil / 1000).toFixed(1)}B bbl` : `${hoveredCountry.oil}M bbl`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Region</span>
                <span style={{ color: "#999" }}>{hoveredCountry.region}</span>
              </div>
              {hoveredCountry.claimed && hoveredCountry.claim && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>President</span>
                    <span style={{ color: "#E8E0D0", fontFamily: "monospace", fontSize: 11 }}>
                      {hoveredCountry.claim.president.slice(0, 4)}...{hoveredCountry.claim.president.slice(-4)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Population</span>
                    <span style={{ color: "#E8E0D0" }}>{hoveredCountry.claim.population.toLocaleString()} holders</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>GDP</span>
                    <span style={{ color: "#22C55E" }}>${hoveredCountry.claim.gdp.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      
    </div>
  );
}
