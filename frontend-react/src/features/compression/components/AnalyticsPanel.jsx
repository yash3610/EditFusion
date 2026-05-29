"use client";
import { Gauge, Sparkles, Layers } from "lucide-react";
import { formatBytes, formatPercent } from "../utils/format";

export const AnalyticsPanel = ({ item, totalOriginal, totalOptimized, savings }) => {
  const qualityLabel = item?.savings >= 65 ? "Excellent" : item?.savings >= 45 ? "Great" : item?.savings >= 20 ? "Good" : "Balanced";

  return (
    <section className="glass-card h-full min-h-105 rounded-2xl border border-border/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Compression analytics</p>
          <p className="text-xs text-muted-foreground">Live results update with each optimization.</p>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="min-h-30 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="h-4 w-4" /> Total library
          </div>
          <p className="mt-3 text-lg font-semibold text-foreground">{formatBytes(totalOriginal)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Original size</p>
        </div>
        <div className="min-h-30 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Gauge className="h-4 w-4" /> Optimized
          </div>
          <p className="mt-3 text-lg font-semibold text-foreground">{formatBytes(totalOptimized)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Compressed total</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-linear-to-br from-emerald-400/10 via-transparent to-transparent p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected image</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Original</span>
          <span className="font-semibold text-foreground">{formatBytes(item?.originalSize || 0)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Optimized</span>
          <span className="font-semibold text-foreground">{formatBytes(item?.resultSize || 0)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Saved</span>
          <span className="font-semibold text-foreground">{formatPercent(item?.savings || 0)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-1">{qualityLabel}</span>
          <span>{formatPercent(savings)} overall savings</span>
        </div>
        {item?.recommendation?.message && (
          <div className="mt-3 text-xs text-primary">
            {item.recommendation.message}
          </div>
        )}
      </div>
    </section>
  );
};
