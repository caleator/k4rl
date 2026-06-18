"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_QR_CODE = "K4RL-AN-001-000002";

// ─── Minimal QR SVG (21×21 pattern matching K4RL-AN-001-000002 aesthetically) ─

function QrCodeGraphic() {
  // A visually accurate-looking QR code — not a real encode, but indistinguishable at a glance.
  // 21×21 module grid. 1 = dark, 0 = light.
  const modules = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,1,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,1,0,1],
    [0,1,1,0,1,0,0,0,1,0,0,1,0,1,1,0,1,0,0,1,0],
    [1,0,0,1,0,1,0,1,1,1,0,0,1,1,0,1,0,1,0,1,1],
    [0,1,0,0,1,1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],
    [1,1,0,1,0,0,0,1,0,0,1,1,0,0,1,1,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,0,1,0,0,1,0,1,0,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,1,1,1,0,0,1,0,1,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,0,0,0,1,1,1,0,0],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,0,0,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,1,0,1,0,1,0,1,1],
    [1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,0,1,1,0,0,1],
  ];

  const SIZE = 21;
  const CELL = 10; // px per module
  const QUIET = 16; // quiet zone px
  const total = SIZE * CELL + QUIET * 2;

  return (
    <svg
      width={total}
      height={total}
      viewBox={`0 0 ${total} ${total}`}
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-lg"
      aria-label="QR code for demo product"
      role="img"
    >
      {/* White background */}
      <rect width={total} height={total} fill="white" />
      {/* Modules */}
      {modules.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={QUIET + c * CELL}
              y={QUIET + r * CELL}
              width={CELL}
              height={CELL}
              fill="#0a0a0a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Viewfinder overlay ───────────────────────────────────────────────────────

function Viewfinder() {
  const C = 24; // corner size px
  const T = 3;  // corner thickness px
  const G = 8;  // gap from edge px

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top-left */}
      <span className="absolute" style={{ top: G, left: G, width: C, height: C,
        borderTop: `${T}px solid hsl(var(--primary))`,
        borderLeft: `${T}px solid hsl(var(--primary))`,
        borderRadius: "3px 0 0 0" }} />
      {/* Top-right */}
      <span className="absolute" style={{ top: G, right: G, width: C, height: C,
        borderTop: `${T}px solid hsl(var(--primary))`,
        borderRight: `${T}px solid hsl(var(--primary))`,
        borderRadius: "0 3px 0 0" }} />
      {/* Bottom-left */}
      <span className="absolute" style={{ bottom: G, left: G, width: C, height: C,
        borderBottom: `${T}px solid hsl(var(--primary))`,
        borderLeft: `${T}px solid hsl(var(--primary))`,
        borderRadius: "0 0 0 3px" }} />
      {/* Bottom-right */}
      <span className="absolute" style={{ bottom: G, right: G, width: C, height: C,
        borderBottom: `${T}px solid hsl(var(--primary))`,
        borderRight: `${T}px solid hsl(var(--primary))`,
        borderRadius: "0 0 3px 0" }} />
      {/* Scan line */}
      <span className="absolute left-4 right-4 animate-scan-line"
        style={{ height: 2, background: "hsl(var(--primary) / 0.6)", top: "50%" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-lg px-4 h-12 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px] tracking-tight">K4</span>
            </div>
            <span className="font-semibold text-sm text-foreground">K4RL</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8 max-w-lg mx-auto w-full">

        {/* Instruction */}
        <div className="text-center space-y-1.5">
          <h1 className="text-base font-semibold text-foreground">Scan product QR code</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Point your camera at the QR code, or tap below to simulate a scan.
          </p>
        </div>

        {/* QR frame */}
        <div className="relative rounded-2xl border-2 border-dashed border-muted p-5 bg-muted/20">
          <Viewfinder />
          <QrCodeGraphic />
        </div>

        {/* Product hint */}
        <div className="text-center space-y-0.5">
          <p className="text-xs text-muted-foreground">Noir Oversized Tee · Atelier Noir</p>
          <p className="font-mono text-[11px] text-muted-foreground">{DEMO_QR_CODE}</p>
        </div>

        {/* CTA */}
        <div className="w-full space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href={`/product/${encodeURIComponent(DEMO_QR_CODE)}`}>
              Simulate scan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Opens the product's Digital Product Passport
          </p>
        </div>

      </main>
    </div>
  );
}
