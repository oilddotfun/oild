"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";

/* ══════════════ TYPES ══════════════ */

interface CountryData {
  code: string; numCode: string; name: string; oil: number;
  region: string; claimed: boolean;
  claim: { president: string; tokenAddress: string; population: number; gdp: number } | null;
}

/* ══════════════ WELCOME MODAL ══════════════ */

const TOKEN_CA = "COMING SOON";

function WelcomeModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
        maxWidth: 420, width: "100%", overflow: "hidden",
      }}>
        <div style={{
          position: "relative", padding: "28px 24px 20px", textAlign: "center",
          background: "linear-gradient(180deg, rgba(212,160,23,0.15) 0%, transparent 100%)",
        }}>
          <img src="/logo.jpg" alt="OILD" style={{ height: 48, borderRadius: 8, marginBottom: 12 }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#E8E0D0", margin: 0 }}>Welcome to OILD.fun!</h2>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, margin: "0 0 20px" }}>
            Every country on the world map has its own token! Whether you want to be a token leader or invest in a country token, this is a full-scale battle for nations!
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#E8E0D0", margin: "0 0 8px" }}>Buy $OILD Token</p>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
            padding: "10px 14px", marginBottom: 20,
          }}>
            <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" style={{ width: 20, height: 20, borderRadius: 999 }} />
            <span style={{ flex: 1, fontSize: 11, color: "#888", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {TOKEN_CA}
            </span>
            <button onClick={() => {
              navigator.clipboard.writeText(TOKEN_CA);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }} style={{
              background: "none", border: "none", cursor: "pointer", padding: 4, color: copied ? "#22C55E" : "#666", fontSize: 14,
            }}>
              {copied ? "\u2713" : "\u2398"}
            </button>
          </div>
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, margin: "0 0 16px" }}>
            By purchasing the official and primary token of the platform, $OILD, you can help more country tokens join our ecosystem and support the growth of existing ones.
          </p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.6, margin: "0 0 20px" }}>
            <strong style={{ color: "#999" }}>Please note:</strong> The country tokens on this platform have no affiliation with real-world countries and are created purely for entertainment purposes. Remember, each token is created by other visitors like you, so always invest responsibly.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" style={{
              flex: 1, padding: "12px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "#E8E0D0", fontSize: 12, fontWeight: 700, textAlign: "center",
              textDecoration: "none",
            }}>$OILD</a>
            <Link href="/leaderboard" style={{
              flex: 1, padding: "12px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "#E8E0D0", fontSize: 12, fontWeight: 700, textAlign: "center",
              textDecoration: "none",
            }}>How to Use?</Link>
            <button onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: "#D4A017", color: "#0A0A0A",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>I Agree</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ color: "#555" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <span style={{ fontSize: 10, color: "#444" }}>Powered by Solana.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ MAIN PAGE ══════════════ */

const MAP_W = 960;
const MAP_H = 500;

// d3-geo projection — handles antimeridian clipping properly (no cross-map lines)
const projection = geoNaturalEarth1()
  .scale(160)
  .translate([MAP_W / 2, MAP_H / 2]);

const pathGenerator = geoPath().projection(projection);

export default function Home() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [features, setFeatures] = useState<any[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => setCountries(d.countries || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((topo: Topology) => {
        const geojson = feature(topo, topo.objects.countries as GeometryCollection);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feats = (geojson as any).features.filter((f: any) => f.id !== "010"); // remove Antarctica
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

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 100,
        background: "rgba(20,20,20,0.85)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999,
        padding: "0 32px", height: 48,
        display: "flex", alignItems: "center", gap: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo.jpg" alt="OILD" style={{ height: 28, borderRadius: 4 }} />
        </Link>
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

      {/* MAP */}
      <section ref={mapRef} onMouseMove={handleMouseMove}
        style={{ position: "relative", width: "100%", height: "100vh" }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <rect width={MAP_W} height={MAP_H} fill="#0A0A0A" />

          {features.map((f) => {
            const id = String(f.id);
            const cData = countryByNum.get(id);
            const isClaimed = cData?.claimed || false;
            const isHov = hovered === id;

            // Use d3-geo pathGenerator — handles antimeridian, poles, everything
            const d = pathGenerator(f as GeoPermissibleObjects) || "";
            if (!d) return null;

            let fill = "#3D3A33";
            if (cData) fill = isClaimed ? "#F59E0B" : "#E8943A";
            if (isHov) fill = isClaimed ? "#FBBF24" : "#F0A94E";

            return (
              <path
                key={id}
                d={d}
                fill={fill}
                stroke="#0A0A0A"
                strokeWidth={isHov ? 1.2 : 0.5}
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
