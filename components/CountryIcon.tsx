"use client";

import { useEffect, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

const SIZE = 512;
const PADDING = 40;

interface CountryIconProps {
  numCode: string;
  name: string;
  claimed?: boolean;
}

export default function CountryIcon({ numCode, name, claimed }: CountryIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featRef = useRef<any>(null);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((topo: Topology) => {
        const geojson = feature(topo, topo.objects.countries as GeometryCollection);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feat = (geojson as any).features.find((f: any) => f.id === numCode);
        if (feat) {
          featRef.current = feat;
          renderIcon(feat);
          setReady(true);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numCode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderIcon = (feat: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    // Clear with transparent background
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Fit country to canvas with padding
    const projection = geoMercator().fitExtent(
      [[PADDING, PADDING], [SIZE - PADDING, SIZE - PADDING]],
      feat
    );
    const pathGen = geoPath().projection(projection).context(ctx);

    // Draw filled silhouette
    ctx.beginPath();
    pathGen(feat);
    const fillColor = claimed ? "#F59E0B" : "#E8943A";
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Subtle stroke
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-icon-512x512.png`;
    a.click();
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback: just download
      downloadPNG();
    }
  };

  const [copied, setCopied] = useState(false);

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: 10, padding: 20, marginBottom: 16,
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>
        Token Icon (512x512)
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Preview */}
        <div style={{
          width: 80, height: 80, borderRadius: 10, overflow: "hidden",
          background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <canvas
            ref={canvasRef}
            width={SIZE} height={SIZE}
            style={{ width: 72, height: 72 }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px", lineHeight: 1.5 }}>
            Use this silhouette as the token icon on pump.fun. Transparent background, 512x512px.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={copyToClipboard}
              disabled={!ready}
              style={{
                padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(212,160,23,0.3)",
                background: copied ? "rgba(34,197,94,0.1)" : "rgba(212,160,23,0.08)",
                color: copied ? "#22C55E" : "#D4A017",
                fontSize: 11, fontWeight: 600, cursor: ready ? "pointer" : "default",
                opacity: ready ? 1 : 0.4,
              }}
            >
              {copied ? "Copied!" : "Copy Image"}
            </button>
            <button
              onClick={downloadPNG}
              disabled={!ready}
              style={{
                padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "#888",
                fontSize: 11, fontWeight: 600, cursor: ready ? "pointer" : "default",
                opacity: ready ? 1 : 0.4,
              }}
            >
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
