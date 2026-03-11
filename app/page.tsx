"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { geoNaturalEarth1, geoPath, geoMercator, geoCentroid } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import WarPanel from "@/components/WarPanel";
import type { War } from "@/components/WarPanel";
import DeclareWar from "@/components/DeclareWar";

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
        <div style={{ position: "relative" }}>
          <img src="/banner.jpg" alt="OILD World Map" style={{ width: "100%", display: "block" }} />
          <h2 style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            fontSize: 20, fontWeight: 800, color: "#E8E0D0", margin: 0,
            padding: "40px 24px 16px",
            background: "linear-gradient(transparent, rgba(17,17,17,1))",
            textAlign: "center",
          }}>Welcome to OILD.fun!</h2>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, margin: "0 0 20px" }}>
            Every country on the world map has its own token! Whether you want to be a token leader or invest in a country token, this is a full-scale battle for nations!
          </p>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px" }}>$OILD Token: <span style={{ color: "#D4A017" }}>coming soon...</span></p>
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
              color: "#E8E0D0", fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none",
            }}>$OILD</a>
            <Link href="/how" style={{
              flex: 1, padding: "12px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "#E8E0D0", fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none",
            }}>How to Use?</Link>
            <button onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: "#D4A017", color: "#0A0A0A", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>I Agree</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
            <a href="https://x.com/Oilddotfun" target="_blank" rel="noopener noreferrer" style={{ color: "#E8E0D0", display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span style={{ fontSize: 11, fontWeight: 600 }}>@Oilddotfun</span>
            </a>
            <span style={{ fontSize: 10, color: "#444" }}>Powered by Solana.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ COUNTRY POPUP (on-map) ══════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CountryPopup({ country, feat, allCountries, onClose, onDeclareWar }: { country: CountryData; feat: any; allCountries: CountryData[]; onClose: () => void; onDeclareWar?: (defenderCode: string, defenderName: string) => void }) {
  // Generate silhouette using d3-geo
  const silhouettePath = useMemo(() => {
    const proj = geoMercator().fitExtent([[4, 4], [96, 96]], feat as GeoPermissibleObjects);
    const gen = geoPath().projection(proj);
    return gen(feat as GeoPermissibleObjects) || "";
  }, [feat]);

  // Calculate rank by oil
  const rank = allCountries
    .filter(c => c.oil > 0)
    .sort((a, b) => b.oil - a.oil)
    .findIndex(c => c.code === country.code) + 1;

  const oilDisplay = country.oil >= 1000 ? `${(country.oil / 1000).toFixed(1)}B` : `${country.oil}M`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.5)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#F5F0E8", borderRadius: 16, maxWidth: 340, width: "100%",
        overflow: "hidden", position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: "absolute", top: 12, right: 12, zIndex: 10,
          width: 28, height: 28, borderRadius: 999, border: "none",
          background: "#E8943A", color: "white", fontSize: 14, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>x</button>

        {/* Silhouette */}
        <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "center" }}>
          <svg width={100} height={100} viewBox="0 0 100 100">
            <path d={silhouettePath} fill="#E8943A" stroke="#D4820F" strokeWidth={0.8} strokeLinejoin="round" />
          </svg>
        </div>

        {/* Content */}
        <div style={{ padding: "12px 24px 24px" }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1A1A1A", margin: "0 0 8px" }}>{country.name}</h3>

          {!country.claimed ? (
            <>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: "0 0 20px" }}>
                This country does not yet have a country token and is not governed by anyone. You can be the first to create this country&apos;s token and take control of its future.
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1, background: "#EDE8DE", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#999", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Oil Reserves</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", margin: 0 }}>{oilDisplay} bbl</p>
                </div>
                <div style={{ flex: 1, background: "#EDE8DE", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#999", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Global Rank</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", margin: 0 }}>#{rank || "--"}</p>
                </div>
              </div>

              <Link href={`/country/${country.code}`} style={{
                display: "block", width: "100%", padding: "14px", borderRadius: 10,
                border: "1px solid #ccc", background: "transparent",
                color: "#1A1A1A", fontSize: 13, fontWeight: 700, textAlign: "center",
                textDecoration: "none", marginBottom: 8,
              }}>Global Rank</Link>

              <Link href={`/country/${country.code}`} style={{
                display: "block", width: "100%", padding: "14px", borderRadius: 10,
                border: "none", background: "#E8943A",
                color: "white", fontSize: 14, fontWeight: 700, textAlign: "center",
                textDecoration: "none",
              }}>Generate Country Token</Link>
            </>
          ) : (
            <>
              {/* Claimed stats */}
              <div style={{ display: "flex", gap: 8, margin: "0 0 12px" }}>
                <div style={{ flex: 1, background: "#EDE8DE", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#999", margin: "0 0 2px", textTransform: "uppercase" }}>Oil Reserves</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", margin: 0 }}>{oilDisplay} bbl</p>
                </div>
                <div style={{ flex: 1, background: "#EDE8DE", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#999", margin: "0 0 2px", textTransform: "uppercase" }}>Global Rank</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", margin: 0 }}>#{rank || "--"}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, margin: "0 0 16px" }}>
                <div style={{ flex: 1, background: "#EDE8DE", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#999", margin: "0 0 2px", textTransform: "uppercase" }}>Population</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", margin: 0 }}>{country.claim?.population?.toLocaleString() || "0"}</p>
                </div>
                <div style={{ flex: 1, background: "#EDE8DE", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#999", margin: "0 0 2px", textTransform: "uppercase" }}>GDP</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", margin: 0 }}>{country.claim?.gdp ? `$${(country.claim.gdp / 1000).toFixed(0)}K` : "$0"}</p>
                </div>
              </div>

              <div style={{ background: "#EDE8DE", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#999" }}>President</span>
                  <span style={{ fontFamily: "monospace", color: "#1A1A1A", fontSize: 11 }}>
                    {country.claim?.president.slice(0, 6)}...{country.claim?.president.slice(-4)}
                  </span>
                </div>
                {country.claim?.tokenAddress && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#999" }}>Token</span>
                    <a href={`https://pump.fun/coin/${country.claim.tokenAddress}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: "#E8943A", textDecoration: "none", fontFamily: "monospace", fontSize: 11 }}>
                      {country.claim.tokenAddress.slice(0, 6)}...{country.claim.tokenAddress.slice(-4)}
                    </a>
                  </div>
                )}
              </div>

              <Link href={`/country/${country.code}`} style={{
                display: "block", width: "100%", padding: "14px", borderRadius: 10,
                border: "none", background: "#E8943A",
                color: "white", fontSize: 14, fontWeight: 700, textAlign: "center",
                textDecoration: "none", marginBottom: 8,
              }}>View Nation</Link>

              <button onClick={() => onDeclareWar?.(country.code, country.name)} style={{
                display: "block", width: "100%", padding: "14px", borderRadius: 10,
                border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)",
                color: "#EF4444", fontSize: 13, fontWeight: 700, textAlign: "center",
                cursor: "pointer",
              }}>Declare War</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════ MAIN PAGE ══════════════ */

const MAP_W = 960;
const MAP_H = 500;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCountry, setSelectedCountry] = useState<{ data: CountryData; feat: any } | null>(null);
  const [activeWars, setActiveWars] = useState<War[]>([]);
  const [declareWarTarget, setDeclareWarTarget] = useState<{ attacker: string; defender: string; defenderName: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
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
        const feats = (geojson as any).features.filter((f: any) => f.id !== "010");
        setFeatures(feats);
      })
      .catch(err => console.error("Map load error:", err));
  }, []);

  const countryByNum = new Map(countries.map(c => [c.numCode, c]));

  // Countries currently at war (for map pulsing)
  const atWarCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const w of activeWars) {
      codes.add(w.attackerCode);
      codes.add(w.defenderCode);
    }
    return codes;
  }, [activeWars]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(1, Math.min(8, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMoveMap = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  return (
    <div style={{ height: "100vh", background: "#0A0A0A", color: "#E8E0D0", overflow: "hidden" }}>

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {/* Declare War modal */}
      {declareWarTarget && (
        <DeclareWar
          attackerCode={declareWarTarget.attacker}
          defenderCode={declareWarTarget.defender}
          defenderName={declareWarTarget.defenderName}
          onSuccess={() => {
            setDeclareWarTarget(null);
            setSelectedCountry(null);
          }}
          onClose={() => setDeclareWarTarget(null)}
        />
      )}

      {/* Country popup */}
      {selectedCountry && (
        <CountryPopup
          country={selectedCountry.data}
          feat={selectedCountry.feat}
          allCountries={countries}
          onClose={() => setSelectedCountry(null)}
          onDeclareWar={(defCode, defName) => {
            // Need the user to pick their attacking nation — for now use a prompt
            const attackerCode = prompt("Enter YOUR nation's country code (e.g. US, SA, AU):");
            if (attackerCode) {
              setDeclareWarTarget({ attacker: attackerCode.toUpperCase(), defender: defCode, defenderName: defName });
            }
          }}
        />
      )}

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
        <Link href="/how" style={{ fontSize: 12, color: "#888", textDecoration: "none", fontWeight: 500 }}>How it Works</Link>
        <WarPanel onActiveWarsChange={setActiveWars} />
        <a href="https://x.com/Oilddotfun" target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", color: "#888", transition: "color 0.15s",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <Link href="/leaderboard" style={{
          padding: "7px 18px", borderRadius: 999, border: "none", display: "inline-block",
          background: "#D4A017", color: "#0A0A0A", fontSize: 11, fontWeight: 700, cursor: "pointer",
          textDecoration: "none",
        }}>
          Leaderboard
        </Link>
      </nav>

      {/* MAP */}
      <section ref={mapRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveMap}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ position: "relative", width: "100%", height: "100vh", cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice"
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.15s ease-out",
          }}>
          <rect width={MAP_W} height={MAP_H} fill="#0A0A0A" />

          {features.map((f) => {
            const id = String(f.id);
            const cData = countryByNum.get(id);
            const isClaimed = cData?.claimed || false;
            const isHov = hovered === id;

            const d = pathGenerator(f as GeoPermissibleObjects) || "";
            if (!d) return null;

            const isAtWar = cData ? atWarCodes.has(cData.code) : false;
            let fill = "#3D3A33";
            if (cData) fill = isClaimed ? "#F59E0B" : "#E8943A";
            if (isAtWar) fill = "#EF4444";
            if (isHov) fill = isAtWar ? "#FF6B6B" : isClaimed ? "#FBBF24" : "#F0A94E";

            return (
              <path
                key={id}
                d={d}
                fill={fill}
                stroke="#0A0A0A"
                strokeWidth={isHov ? 1.2 : 0.5}
                strokeLinejoin="round"
                style={{
                  cursor: cData ? "pointer" : "default",
                  transition: "fill 0.12s",
                  animation: isAtWar ? "pulse 1.5s ease-in-out infinite" : "none",
                }}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  if (cData) setSelectedCountry({ data: cData, feat: f });
                }}
              />
            );
          })}

          {/* Country labels — every country with data */}
          {features.map((f) => {
            const id = String(f.id);
            const cData = countryByNum.get(id);
            if (!cData) return null;
            try {
              const centroid = projection(geoCentroid(f as GeoPermissibleObjects));
              if (!centroid) return null;
              // Short names to prevent overflow
              const shortNames: Record<string, string> = {
                "United States": "USA", "United Arab Emirates": "UAE",
                "United Kingdom": "UK", "South Korea": "S. Korea",
                "North Korea": "N. Korea", "South Africa": "S. Africa",
                "South Sudan": "S. Sudan", "Saudi Arabia": "Saudi",
                "New Zealand": "NZ", "Papua New Guinea": "PNG",
                "Dominican Republic": "DR", "Central African Republic": "CAR",
                "Equatorial Guinea": "Eq. Guinea", "Trinidad and Tobago": "T&T",
                "Czech Republic": "Czechia", "North Macedonia": "N. Mac.",
                "Bosnia": "BiH", "Guinea-Bissau": "G-Bis.",
                "Burkina Faso": "B. Faso", "Ivory Coast": "C. d'Iv.",
                "DR Congo": "DRC", "El Salvador": "El Salv.",
                "Sri Lanka": "Sri L.", "Bangladesh": "Bangla.",
                "Philippines": "Philip.", "Turkmenistan": "Turkm.",
                "Uzbekistan": "Uzbek.", "Afghanistan": "Afghan.",
                "Kazakhstan": "Kazakh.", "Azerbaijan": "Azerb.",
                "Mozambique": "Mozam.", "Madagascar": "Madag.",
                "Switzerland": "Swiss", "Netherlands": "Neth.",
                "Costa Rica": "C. Rica", "Kyrgyzstan": "Kyrgyz.",
                "Tajikistan": "Tajik.", "Montenegro": "Mntneg.",
                "Sierra Leone": "S. Leone",
              };
              const label = shortNames[cData.name] || cData.name;
              return (
                <text
                  key={`label-${id}`}
                  x={centroid[0]}
                  y={centroid[1] + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: 3.2,
                    fill: "rgba(255,255,255,0.7)",
                    fontWeight: 600,
                    fontFamily: "Inter, system-ui, sans-serif",
                    pointerEvents: "none",
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </text>
              );
            } catch {
              return null;
            }
          })}
        </svg>

        {/* Zoom controls */}
        {zoom > 1 && (
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{
            position: "absolute", bottom: 20, right: 20, zIndex: 50,
            padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(20,20,20,0.9)", color: "#888", fontSize: 11, fontWeight: 600,
            cursor: "pointer", backdropFilter: "blur(8px)",
          }}>
            Reset Zoom ({zoom.toFixed(1)}x)
          </button>
        )}
      </section>
    </div>
  );
}
