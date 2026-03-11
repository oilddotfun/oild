"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ══════════════ TYPES ══════════════ */

interface CountryData {
  code: string; numCode: string; name: string; oil: number;
  region: string; claimed: boolean;
  claim: { president: string; tokenAddress: string; population: number; gdp: number } | null;
}

/* ══════════════ TOPOJSON DECODER ══════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeTopology(topo: any) {
  const { arcs: rawArcs, transform } = topo;
  const { scale, translate } = transform;

  // Decode quantized arcs to absolute coordinates
  const decodedArcs: number[][][] = rawArcs.map((arc: number[][]) => {
    let px = 0, py = 0;
    return arc.map((delta: number[]) => {
      px += delta[0];
      py += delta[1];
      return [px * scale[0] + translate[0], py * scale[1] + translate[1]];
    });
  });

  return { decodedArcs, geometries: topo.objects.countries.geometries };
}

function decodeRing(indices: number[], decodedArcs: number[][][]): number[][] {
  const coords: number[][] = [];
  for (const idx of indices) {
    const forward = idx >= 0;
    const arcIdx = forward ? idx : ~idx;
    const arc = decodedArcs[arcIdx];
    if (!arc) continue;
    const points = forward ? arc : [...arc].reverse();
    for (let i = 0; i < points.length; i++) {
      // Skip first point of subsequent arcs (shared with previous arc's last point)
      if (coords.length > 0 && i === 0) continue;
      coords.push(points[i]);
    }
  }
  return coords;
}

/* ══════════════ PROJECTION ══════════════ */

function mercator(lon: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lon + 180) / 360) * w;
  const latR = (lat * Math.PI) / 180;
  // Clamp to avoid infinity near poles
  const clampedLat = Math.max(-85, Math.min(85, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  void latR;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = h / 2 - (w * mercN) / (2 * Math.PI);
  return [x, y];
}

function ringToSvg(ring: number[][], w: number, h: number): string {
  if (ring.length < 2) return "";
  let d = "";
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = mercator(ring[i][0], ring[i][1], w, h);
    d += i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d + "Z";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function geometryToSvg(geom: any, decodedArcs: number[][][], w: number, h: number): string {
  if (geom.type === "Polygon") {
    return geom.arcs.map((ring: number[]) => ringToSvg(decodeRing(ring, decodedArcs), w, h)).join("");
  }
  if (geom.type === "MultiPolygon") {
    return geom.arcs.map((poly: number[][]) =>
      poly.map((ring: number[]) => ringToSvg(decodeRing(ring, decodedArcs), w, h)).join("")
    ).join("");
  }
  return "";
}

/* ══════════════ TICKER ══════════════ */

function Ticker({ countries }: { countries: CountryData[] }) {
  const claimed = countries.filter(c => c.claimed);
  const text = claimed.length > 0
    ? claimed.map(c => `${c.name} CLAIMED`).join("  --  ") + "  --  OIL WARS LIVE"
    : "OIL WARS LIVE  --  Claim a nation. Deploy the token. Become President.  --  Every country. One owner. Forever.";

  return (
    <div style={{
      background: "rgba(212,160,23,0.05)", borderBottom: "1px solid rgba(212,160,23,0.12)",
      padding: "8px 0", overflow: "hidden", whiteSpace: "nowrap", fontSize: 12,
      fontWeight: 600, color: "#D4A017", letterSpacing: "0.04em",
    }}>
      <div style={{ display: "inline-block", animation: "scroll-left 40s linear infinite" }}>
        {[0, 1, 2].map(i => <span key={i} style={{ padding: "0 60px" }}>{text}</span>)}
      </div>
    </div>
  );
}

/* ══════════════ MAIN ══════════════ */

export default function Home() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapData, setMapData] = useState<{ decodedArcs: number[][][]; geometries: any[] } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const W = 960, H = 560;

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => setCountries(d.countries || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(topo => setMapData(decodeTopology(topo)))
      .catch(err => console.error("Map load failed:", err));
  }, []);

  const countryByNum = new Map(countries.map(c => [c.numCode, c]));

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#E8E0D0" }}>

      {/* ── NAV (oval pill) ── */}
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
        <a href="#how" style={{ fontSize: 12, color: "#888", textDecoration: "none", fontWeight: 500 }}>How it Works</a>
        <Link href="/leaderboard" style={{ fontSize: 12, color: "#888", textDecoration: "none", fontWeight: 500 }}>Leaderboard</Link>
        <button style={{
          padding: "7px 18px", borderRadius: 999, border: "none",
          background: "#D4A017", color: "#0A0A0A", fontSize: 11, fontWeight: 700, cursor: "pointer",
        }}>
          Connect Wallet
        </button>
      </nav>

      {/* ── TICKER ── */}
      <div style={{ paddingTop: 80 }}>
        <Ticker countries={countries} />
      </div>

      {/* ── FULL-SCREEN MAP ── */}
      <section ref={mapRef} onMouseMove={handleMouseMove}
        style={{ position: "relative", width: "100%", padding: "0", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <rect width={W} height={H} fill="#0A0A0A" />

          {/* Grid lines (faint) */}
          {Array.from({ length: 7 }, (_, i) => {
            const lon = -180 + (i + 1) * (360 / 8);
            const [x] = mercator(lon, 0, W, H);
            return <line key={`vl${i}`} x1={x} y1={0} x2={x} y2={H} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />;
          })}
          {Array.from({ length: 5 }, (_, i) => {
            const lat = -60 + i * 30;
            const [, y] = mercator(0, lat, W, H);
            return <line key={`hl${i}`} x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />;
          })}

          {/* Country paths */}
          {mapData && mapData.geometries.map((geom) => {
            const id = geom.id;
            const cData = countryByNum.get(id);
            const isClaimed = cData?.claimed || false;
            const isHovered = hovered === id;
            const path = geometryToSvg(geom, mapData.decodedArcs, W, H);
            if (!path) return null;

            let fill = "#3D3A33"; // default — dark muted for countries without data
            if (cData) {
              fill = isClaimed ? "#D4A017" : "#B8A88A"; // gold if claimed, tan if in our list
            }
            if (isHovered) fill = isClaimed ? "#F59E0B" : "#C4A882";

            return (
              <path
                key={id}
                d={path}
                fill={fill}
                stroke="#1A1A18"
                strokeWidth={isHovered ? 1 : 0.4}
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
            position: "absolute", left: Math.min(mousePos.x + 16, (mapRef.current?.clientWidth || 900) - 260), top: mousePos.y - 10,
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

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{
        maxWidth: 900, margin: "0 auto", padding: "60px 24px 80px", scrollMarginTop: 80,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#E8E0D0", textAlign: "center", marginBottom: 8 }}>
          How It Works
        </h2>
        <p style={{ fontSize: 13, color: "#666", textAlign: "center", marginBottom: 40 }}>
          Claim nations. Build armies. Wage oil wars.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { n: "01", title: "Claim a Nation", desc: "Choose an unclaimed country. Deploy its national token on pump.fun with the supplied info (name, ticker, image). Submit the token address to claim it. You become President." },
            { n: "02", title: "Build Population", desc: "Your nation's population is the token's total holder count. More holders = bigger army. Rally your community on X to grow your nation." },
            { n: "03", title: "Grow Your GDP", desc: "Your GDP is your token's market cap. Higher market cap = more powerful economy. Fund your war chest." },
            { n: "04", title: "Declare War", desc: "Attack other nations to steal their oil reserves. Wars are decided by your army size (holders) vs theirs. Bigger population wins. The loser has oil barrels transferred to the winner." },
            { n: "05", title: "Dominate", desc: "Climb the leaderboard. Control the global oil supply. The nation with the most oil at the end of each epoch wins rewards." },
          ].map(s => (
            <div key={s.n} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 10, padding: 20,
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#D4A017", display: "block", marginBottom: 8 }}>{s.n}</span>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#E8E0D0", margin: "0 0 6px" }}>{s.title}</p>
              <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "#444" }}>OILD.fun -- The on-chain oil war. Built on Solana.</p>
      </footer>
    </div>
  );
}
