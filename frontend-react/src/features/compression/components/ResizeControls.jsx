"use client";
import { useCompressionStore } from "../store/compression-store";

const presets = [
  { label: "Instagram Post", width: 1080, height: 1080 },
  { label: "YouTube Thumb", width: 1280, height: 720 },
  { label: "WhatsApp Status", width: 1080, height: 1920 },
  { label: "Facebook Cover", width: 820, height: 312 },
];

export const ResizeControls = () => {
  const resize = useCompressionStore((state) => state.settings.resize);
  const updateResize = useCompressionStore((state) => state.updateResize);

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resize</p>
        <span className="text-[11px] text-muted-foreground">Pixels</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={resize.enabled}
            onChange={(event) => updateResize({ enabled: event.target.checked })}
          />
          Enable resize
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={resize.keepAspect}
            onChange={(event) => updateResize({ keepAspect: event.target.checked })}
          />
          Keep aspect
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Width</label>
          <input
            type="number"
            min={64}
            className="mt-2 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm"
            value={resize.width}
            onChange={(event) => updateResize({ width: Number(event.target.value) })}
            disabled={!resize.enabled}
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Height</label>
          <input
            type="number"
            min={64}
            className="mt-2 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm"
            value={resize.height}
            onChange={(event) => updateResize({ height: Number(event.target.value) })}
            disabled={!resize.enabled}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            className="rounded-full border border-border/60 px-3 py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
            onClick={() => updateResize({ enabled: true, width: preset.width, height: preset.height })}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
