"use client";

import { RiCheckLine, RiImageLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

/** Boxy media frame — story mood, square corners */
export function BoxyImage({
  imageUrl,
  label,
  aspect = 3 / 4,
  className,
  filterClassName,
  children,
}: {
  imageUrl?: string | null;
  label: string;
  aspect?: number;
  className?: string;
  filterClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-amber-500/25 bg-zinc-900",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {imageUrl ? (
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]",
            filterClassName,
          )}
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label={label}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-zinc-600">
          <RiImageLine className="size-8" aria-hidden />
        </div>
      )}
      {children}
    </div>
  );
}

export function VotedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
        className,
      )}
    >
      <RiCheckLine className="size-3" />
      Voted
    </span>
  );
}

export function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
      }}
      aria-hidden
    />
  );
}

export function GrainOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
      }}
      aria-hidden
    />
  );
}

export function DiagonalStripes() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(251,191,36,0.15) 8px, rgba(251,191,36,0.15) 16px)",
      }}
      aria-hidden
    />
  );
}
