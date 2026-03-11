"use client";

import Link from "next/link";

export default function HowItWorks() {
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
        <Link href="/leaderboard" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>Leaderboard</Link>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "100px 20px 60px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#E8E0D0", marginBottom: 8 }}>How OILD.fun Works</h1>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 40, lineHeight: 1.6 }}>
          A full-scale battle for nations. Claim countries, build armies, declare war.
        </p>

        {/* Step 1 */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(212,160,23,0.15)", color: "#D4A017", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#E8E0D0", margin: 0 }}>Claim a Nation</h2>
          </div>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, paddingLeft: 44 }}>
            Every country on the world map is available to claim. To claim one, deploy the country&apos;s national token on <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" style={{ color: "#D4A017", textDecoration: "none" }}>pump.fun</a> using the country name as the ticker. Then submit the token address on OILD.fun. The deployer becomes the <strong style={{ color: "#E8E0D0" }}>President</strong> of that nation. Each country can only be claimed once — it&apos;s yours forever.
          </p>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(212,160,23,0.15)", color: "#D4A017", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#E8E0D0", margin: 0 }}>Build Your Nation</h2>
          </div>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, paddingLeft: 44 }}>
            <strong style={{ color: "#E8E0D0" }}>Population</strong> = your token&apos;s total holder count. More holders = bigger army.<br/>
            <strong style={{ color: "#E8E0D0" }}>GDP</strong> = your token&apos;s market cap. Higher market cap = stronger economy.<br/>
            Rally your community on X. The bigger your nation, the harder you are to defeat.
          </p>
        </div>

        {/* Step 3 — WAR */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#EF4444", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#EF4444", margin: 0 }}>Declare War</h2>
          </div>
          <div style={{ paddingLeft: 44 }}>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, marginBottom: 16 }}>
              Any claimed nation can attack another claimed nation. Here&apos;s how wars work:
            </p>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#D4A017", margin: "0 0 4px" }}>Cost: 1 SOL</p>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Declaring war costs 1 SOL, sent to the OILD treasury wallet. This launches a <strong style={{ color: "#E8E0D0" }}>missile</strong> at the enemy nation.</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#D4A017", margin: "0 0 4px" }}>Missile = +$100K Volume</p>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>The missile adds $100,000 in trading volume to the attacker&apos;s token. This gives you a head start in the war.</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#D4A017", margin: "0 0 4px" }}>10-Minute War Period</p>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Once war is declared, both tokens have 10 minutes. During this period, both communities trade as hard as they can to generate volume.</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", margin: "0 0 4px" }}>Winner = Most Volume</p>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>When the 10 minutes are up, the token with the <strong style={{ color: "#E8E0D0" }}>highest trading volume</strong> during the war period wins. Volume is tracked live via DexScreener.</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", margin: "0 0 4px" }}>Loser Loses 5% Oil</p>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>The losing nation has 5% of their oil reserves permanently transferred to the winner. Oil is power — lose enough wars and your nation dries up.</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: "0 0 4px" }}>1hr cooldown</p>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>After being attacked, a nation has a 1-hour shield. They can&apos;t be raided again during this period. Plan your attacks wisely.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(212,160,23,0.15)", color: "#D4A017", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>4</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#E8E0D0", margin: 0 }}>Dominate the Leaderboard</h2>
          </div>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, paddingLeft: 44 }}>
            The leaderboard ranks all nations by oil reserves, population, and GDP. Win wars to climb. Lose wars and you drop. The ultimate goal: control the global oil supply. The nation with the most oil dominates the map.
          </p>
        </div>

        {/* Treasury */}
        <div style={{
          background: "rgba(212,160,23,0.06)", border: "1px solid rgba(212,160,23,0.15)",
          borderRadius: 10, padding: 20, marginBottom: 40,
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#D4A017", margin: "0 0 8px" }}>Treasury</p>
          <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, margin: 0 }}>
            All war fees (1 SOL per declaration) go to the OILD treasury. This funds platform development, rewards, and the $OILD token ecosystem. Treasury wallet will be published and fully transparent on-chain.
          </p>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{
            display: "inline-block", padding: "14px 32px", borderRadius: 10,
            background: "#D4A017", color: "#0A0A0A", fontSize: 14, fontWeight: 700,
            textDecoration: "none",
          }}>Explore the Map</Link>
        </div>
      </div>
    </div>
  );
}
