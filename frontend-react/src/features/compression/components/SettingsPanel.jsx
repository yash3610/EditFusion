"use client";
import { SlidersHorizontal, Gauge, Wand2, DownloadCloud } from "lucide-react";
import { useCompressionStore } from "../store/compression-store";
import { ResizeControls } from "./ResizeControls";

const formats = [
  { value: "auto", label: "Auto (recommended)" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "avif", label: "AVIF" },
];

const engines = [
  { value: "browser-image-compression", label: "Smart (browser-image-compression)" },
  { value: "compressorjs", label: "Precision (CompressorJS)" },
];

const modes = [
  { value: "smart", label: "Smart optimization" },
  { value: "lossy", label: "Lossy (smaller size)" },
  { value: "lossless", label: "Lossless (best quality)" },
];

export const SettingsPanel = ({ onProcessAll, isBatchProcessing, onDownloadAll }) => {
  const settings = useCompressionStore((state) => state.settings);
  const setSettings = useCompressionStore((state) => state.setSettings);

  return (
    <section className="glass-card h-full min-h-[420px] rounded-2xl border border-border/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Compression controls</p>
            <p className="text-xs text-muted-foreground">Tune quality, format, and optimization.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-border/60 px-4 py-2 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-40"
            onClick={onDownloadAll}
            disabled={isBatchProcessing}
          >
            <span className="flex items-center gap-2">
              <DownloadCloud className="h-4 w-4" /> Download all
            </span>
          </button>
          <button
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow disabled:opacity-40"
            onClick={onProcessAll}
            disabled={isBatchProcessing}
          >
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" /> Optimize all
            </span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="min-h-[160px] rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Gauge className="h-4 w-4" /> Quality
          </div>
          <div className="mt-4 flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={100}
              value={settings.quality}
              onChange={(event) => setSettings({ quality: Number(event.target.value) })}
              className="h-2 w-full appearance-none rounded-full bg-muted/70 accent-primary"
            />
            <div className="min-w-[48px] rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-semibold">
              {settings.quality}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Higher quality keeps details but increases size.</p>
        </div>

        <div className="min-h-[160px] rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Format</p>
          <select
            className="mt-3 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm"
            value={settings.outputFormat}
            onChange={(event) => setSettings({ outputFormat: event.target.value })}
          >
            {formats.map((format) => (
              <option key={format.value} value={format.value}>{format.label}</option>
            ))}
          </select>
          <p className="mt-3 text-xs text-muted-foreground">Auto picks best format per image.</p>
        </div>

        <div className="min-h-[160px] rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compression mode</p>
          <select
            className="mt-3 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm"
            value={settings.compressionMode}
            onChange={(event) => setSettings({ compressionMode: event.target.value })}
          >
            {modes.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
          <p className="mt-3 text-xs text-muted-foreground">Smart mode balances size and clarity.</p>
        </div>

        <div className="min-h-[160px] rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compression engine</p>
          <select
            className="mt-3 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm"
            value={settings.engine}
            onChange={(event) => setSettings({ engine: event.target.value })}
          >
            {engines.map((engine) => (
              <option key={engine.value} value={engine.value}>{engine.label}</option>
            ))}
          </select>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.removeMetadata}
                onChange={(event) => setSettings({ removeMetadata: event.target.checked })}
              />
              Remove metadata
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.progressive}
                onChange={(event) => setSettings({ progressive: event.target.checked })}
              />
              Progressive
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.livePreview}
                onChange={(event) => setSettings({ livePreview: event.target.checked })}
              />
              Live preview
            </label>
            <span>Auto re-optimize on changes</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <ResizeControls />
        </div>
      </div>
    </section>
  );
};
