"use client";
import { useMemo, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { ZoomIn, ZoomOut, Scan } from "lucide-react";

export const ComparisonPanel = ({ item, onCompress }) => {
  const [zoom, setZoom] = useState(1);

  const comparisonReady = useMemo(() => item?.previewUrl && item?.resultUrl, [item]);
  const preview = item?.previewUrl;
  const result = item?.resultUrl;

  return (
    <section className="glass-card h-full min-h-105 rounded-2xl border border-border/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Live preview</p>
          <p className="text-xs text-muted-foreground">Compare original and optimized image.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-border/60 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
            onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
          >
            <span className="flex items-center gap-2"><ZoomOut className="h-4 w-4" /> Zoom out</span>
          </button>
          <button
            className="rounded-full border border-border/60 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
            onClick={() => setZoom((value) => Math.min(2, value + 0.25))}
          >
            <span className="flex items-center gap-2"><ZoomIn className="h-4 w-4" /> Zoom in</span>
          </button>
          <button
            className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow"
            onClick={onCompress}
            disabled={!item}
          >
            <span className="flex items-center gap-2"><Scan className="h-4 w-4" /> Optimize</span>
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
        {comparisonReady ? (
          <div className="w-full overflow-auto">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={preview} alt="Original" />}
                itemTwo={<ReactCompareSliderImage src={result} alt="Optimized" />}
                className="min-h-65"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            Upload images and run compression to see a comparison.
          </div>
        )}
      </div>
    </section>
  );
};
