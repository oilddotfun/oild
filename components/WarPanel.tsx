"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface War {
  id: string;
  attackerCode: string;
  defenderCode: string;
  attackerToken: string;
  defenderToken: string;
  declaredBy: string;
  startedAt: number;
  endsAt: number;
  status: string;
  winner: string | null;
  oilStolen: number;
  attackerVolume: number;
  defenderVolume: number;
}

interface WarPanelProps {
  onActiveWarsChange?: (wars: War[]) => void;
}

function formatTime(ms: number): string {
  if (ms <= 0) return "0:00";
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function WarPanel({ onActiveWarsChange }: WarPanelProps) {
  const [wars, setWars] = useState<War[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [now, setNow] = useState(Date.now());

  const fetchWars = useCallback(async () => {
    try {
      const res = await fetch("/api/wars?active=true");
      const data = await res.json();
      setWars(data.wars || []);
      onActiveWarsChange?.(data.wars || []);
    } catch { /* ignore */ }
  }, [onActiveWarsChange]);

  useEffect(() => {
    fetchWars();
    const interval = setInterval(fetchWars, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchWars]);

  // Tick every second for countdown
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const activeWars = wars.filter(w => w.status === "active" && w.endsAt > now);

  return (
    <>
      {/* War indicator button in nav */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: "relative",
          padding: "6px 14px", borderRadius: 999, border: "none",
          background: activeWars.length > 0 ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
          color: activeWars.length > 0 ? "#EF4444" : "#666",
          fontSize: 11, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          animation: activeWars.length > 0 ? "pulse 2s ease-in-out infinite" : "none",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19.5 8 12 11.5 4.5 8 12 4.5zM4 9.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7l-7 3.5z"/>
        </svg>
        Wars{activeWars.length > 0 ? ` (${activeWars.length})` : ""}
        {activeWars.length > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            width: 8, height: 8, borderRadius: 999,
            background: "#EF4444",
            animation: "pulse 1s ease-in-out infinite",
          }} />
        )}
      </button>

      {/* War panel dropdown */}
      {showPanel && (
        <div style={{
          position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)",
          zIndex: 150, width: 380, maxHeight: "60vh", overflowY: "auto",
          background: "rgba(17,17,17,0.97)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: 0,
          boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          backdropFilter: "blur(16px)",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#E8E0D0" }}>Active Wars</span>
            <button onClick={() => setShowPanel(false)} style={{
              background: "none", border: "none", color: "#666", fontSize: 16, cursor: "pointer",
            }}>x</button>
          </div>

          {activeWars.length === 0 ? (
            <div style={{ padding: "32px 18px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>No active wars</p>
              <p style={{ fontSize: 11, color: "#444" }}>Click a claimed country on the map to declare war</p>
            </div>
          ) : (
            <div style={{ padding: 8 }}>
              {activeWars.map(war => {
                const remaining = war.endsAt - now;
                const progress = Math.max(0, Math.min(100, ((600000 - remaining) / 600000) * 100));

                return (
                  <div key={war.id} style={{
                    background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 10, padding: 14, marginBottom: 6,
                  }}>
                    {/* Countries */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <Link href={`/country/${war.attackerCode}`} style={{ fontSize: 13, fontWeight: 700, color: "#E8E0D0", textDecoration: "none" }}>
                        {war.attackerCode}
                      </Link>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#EF4444", letterSpacing: "0.05em" }}>VS</span>
                      <Link href={`/country/${war.defenderCode}`} style={{ fontSize: 13, fontWeight: 700, color: "#E8E0D0", textDecoration: "none" }}>
                        {war.defenderCode}
                      </Link>
                    </div>

                    {/* Volume comparison */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 8 }}>
                      <span style={{ color: "#D4A017" }}>Vol: ${war.attackerVolume.toLocaleString()}</span>
                      <span style={{ color: "#D4A017" }}>Vol: ${war.defenderVolume.toLocaleString()}</span>
                    </div>

                    {/* Timer bar */}
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 6 }}>
                      <div style={{
                        height: "100%", borderRadius: 2, width: `${progress}%`,
                        background: "linear-gradient(90deg, #EF4444, #F59E0B)",
                        transition: "width 1s linear",
                      }} />
                    </div>

                    {/* Time remaining */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "#666" }}>
                        {remaining > 0 ? `${formatTime(remaining)} remaining` : "Resolving..."}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 600, color: "#EF4444",
                        padding: "2px 8px", borderRadius: 4,
                        background: "rgba(239,68,68,0.1)",
                      }}>LIVE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent resolved wars */}
          <div style={{ padding: "8px 18px 14px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <Link href="/how" style={{ fontSize: 11, color: "#666", textDecoration: "none" }}>
              How do wars work?
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export type { War };
