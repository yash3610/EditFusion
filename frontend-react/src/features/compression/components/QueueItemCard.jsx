"use client";
import { useMemo } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Download, Trash2, RefreshCw, Sparkles } from "lucide-react";
import { formatBytes, formatPercent } from "../utils/format";

export const QueueItemCard = ({
  item,
  isSelected,
  onSelect,
  onRemove,
  onCompress,
  onDownload,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const ready = useMemo(() => item.resultUrl, [item.resultUrl]);

  return (
    <article
      className={`glass-card flex h-full flex-col rounded-2xl border p-4 transition ${isSelected ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]" : "border-border/60"}`}
      draggable
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground" title={item.file.name}>{item.file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(item.originalSize)} · {item.width}×{item.height}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-border/60 bg-background/60 p-2 text-muted-foreground transition hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg border border-border/60 bg-background/60 p-2 text-muted-foreground transition hover:text-foreground disabled:opacity-40"
            onClick={(event) => {
              event.stopPropagation();
              onDownload();
            }}
            disabled={!ready}
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>Original</span>
          <span>Optimized</span>
        </div>
        <div className="h-[170px] overflow-hidden rounded-lg bg-background/40">
          {ready ? (
            <ReactCompareSlider
              itemOne={<ReactCompareSliderImage src={item.previewUrl} alt="Original" />}
              itemTwo={<ReactCompareSliderImage src={item.resultUrl} alt="Optimized" />}
              className="h-[170px]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Run optimization to preview.
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Compressed size</span>
          <span className="font-semibold text-foreground">{formatBytes(item.resultSize || 0)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Saved</span>
          <span className="font-semibold text-foreground">{formatPercent(item.savings || 0)}</span>
        </div>
        {item.recommendation?.message && (
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-3 w-3" />
            <span>{item.recommendation.message}</span>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <button
          className="rounded-full bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground shadow disabled:opacity-40"
          onClick={(event) => {
            event.stopPropagation();
            onCompress();
          }}
          disabled={item.status === "processing"}
        >
          <span className="flex items-center gap-2">
            <RefreshCw className={`h-3 w-3 ${item.status === "processing" ? "animate-spin" : ""}`} />
            {item.status === "processing" ? "Optimizing" : "Optimize"}
          </span>
        </button>
        {item.error && <span className="text-xs text-destructive">{item.error}</span>}
      </div>
    </article>
  );
};
