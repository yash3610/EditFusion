"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { addDownloadHistory, addRecentFile } from "@/lib/history";
import { useToast } from "@/hooks/use-toast";
import { Download, Sparkles } from "lucide-react";

const loadImage = (file) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
});

const clamp = (value) => Math.max(0, Math.min(255, value));

const setSaturation = (r, g, b, amount) => {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    return [
        clamp(gray + (r - gray) * amount),
        clamp(gray + (g - gray) * amount),
        clamp(gray + (b - gray) * amount),
    ];
};

const applyTone = (data, { brightness = 0, contrast = 1, saturation = 1 }) => {
    for (let index = 0; index < data.length; index += 4) {
        let r = (data[index] - 128) * contrast + 128 + brightness;
        let g = (data[index + 1] - 128) * contrast + 128 + brightness;
        let b = (data[index + 2] - 128) * contrast + 128 + brightness;
        [r, g, b] = setSaturation(r, g, b, saturation);
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
    }
};

const posterize = (data, levels) => {
    const step = 255 / (levels - 1);
    for (let index = 0; index < data.length; index += 4) {
        data[index] = Math.round(data[index] / step) * step;
        data[index + 1] = Math.round(data[index + 1] / step) * step;
        data[index + 2] = Math.round(data[index + 2] / step) * step;
    }
};

const drawEdges = (imageData, strength = 0.6) => {
    const { data, width, height } = imageData;
    const copy = new Uint8ClampedArray(data);
    const luminance = (offset) => 0.299 * copy[offset] + 0.587 * copy[offset + 1] + 0.114 * copy[offset + 2];
    for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
            const offset = (y * width + x) * 4;
            const gx = luminance(offset + 4) - luminance(offset - 4);
            const gy = luminance(offset + width * 4) - luminance(offset - width * 4);
            const edge = Math.min(255, Math.sqrt(gx * gx + gy * gy) * strength);
            if (edge > 24) {
                data[offset] = clamp(data[offset] - edge);
                data[offset + 1] = clamp(data[offset + 1] - edge);
                data[offset + 2] = clamp(data[offset + 2] - edge);
            }
        }
    }
};

const removeBackground = (imageData) => {
    const { data, width, height } = imageData;
    const samples = [];
    const pushSample = (x, y) => {
        const offset = (y * width + x) * 4;
        samples.push([data[offset], data[offset + 1], data[offset + 2]]);
    };
    for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 24))) {
        pushSample(x, 0);
        pushSample(x, height - 1);
    }
    for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 24))) {
        pushSample(0, y);
        pushSample(width - 1, y);
    }
    const bg = samples.reduce((sum, color) => [
        sum[0] + color[0],
        sum[1] + color[1],
        sum[2] + color[2],
    ], [0, 0, 0]).map((value) => value / samples.length);
    for (let index = 0; index < data.length; index += 4) {
        const distance = Math.hypot(data[index] - bg[0], data[index + 1] - bg[1], data[index + 2] - bg[2]);
        if (distance < 58) {
            data[index + 3] = 0;
        }
        else if (distance < 92) {
            data[index + 3] = Math.round((distance - 58) * 7.5);
        }
    }
};

const makeSketch = (imageData) => {
    const { data, width, height } = imageData;
    const copy = new Uint8ClampedArray(data);
    const grayAt = (x, y) => {
        const offset = (y * width + x) * 4;
        return 0.299 * copy[offset] + 0.587 * copy[offset + 1] + 0.114 * copy[offset + 2];
    };
    for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
            const offset = (y * width + x) * 4;
            const edge = Math.abs(grayAt(x + 1, y) - grayAt(x - 1, y)) + Math.abs(grayAt(x, y + 1) - grayAt(x, y - 1));
            const value = clamp(255 - edge * 2.8);
            data[offset] = value;
            data[offset + 1] = value;
            data[offset + 2] = value;
        }
    }
};

const removeObject = (context, width, height, target) => {
    const radius = Math.round(Math.min(width, height) * 0.12);
    const x = Math.round((target?.x ?? 0.5) * width);
    const y = Math.round((target?.y ?? 0.5) * height);
    const sx = Math.max(0, x - radius);
    const sy = Math.max(0, y - radius);
    const size = Math.min(radius * 2, width - sx, height - sy);
    const sourceX = x < width / 2 ? Math.min(width - size, x + radius) : Math.max(0, x - radius - size);
    const sourceY = y < height / 2 ? Math.min(height - size, y + radius) : Math.max(0, y - radius - size);
    context.save();
    context.beginPath();
    context.ellipse(x, y, radius, radius * 0.75, 0, 0, Math.PI * 2);
    context.clip();
    context.filter = "blur(8px)";
    context.drawImage(context.canvas, sourceX, sourceY, size, size, sx, sy, size, size);
    context.restore();
};

const runTool = async (file, tool, target) => {
    const image = await loadImage(file);
    const maxSize = 1800;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);
    if (tool === "object-remove") {
        removeObject(context, width, height, target);
        return canvas.toDataURL("image/png");
    }
    const imageData = context.getImageData(0, 0, width, height);
    if (tool === "background-remove") {
        removeBackground(imageData);
    }
    if (tool === "enhance") {
        applyTone(imageData.data, { brightness: 8, contrast: 1.18, saturation: 1.14 });
    }
    if (tool === "cartoon") {
        applyTone(imageData.data, { brightness: 8, contrast: 1.2, saturation: 1.25 });
        posterize(imageData.data, 6);
        drawEdges(imageData, 1.1);
    }
    if (tool === "anime") {
        applyTone(imageData.data, { brightness: 14, contrast: 1.12, saturation: 1.45 });
        posterize(imageData.data, 8);
        drawEdges(imageData, 0.45);
    }
    if (tool === "sketch") {
        makeSketch(imageData);
    }
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL(tool === "background-remove" ? "image/png" : "image/jpeg", 0.94);
};

const tools = [
    { id: "background-remove", label: "Remove BG", primary: true },
    { id: "enhance", label: "Enhance" },
    { id: "cartoon", label: "Cartoon" },
    { id: "anime", label: "Anime" },
    { id: "sketch", label: "Sketch" },
    { id: "object-remove", label: "Object Remove" },
];

export default function AiToolsPage() {
    const { toast } = useToast();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [resultUrl, setResultUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTool, setActiveTool] = useState(null);
    const [target, setTarget] = useState({ x: 0.5, y: 0.5 });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            setResultUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setResultUrl(null);
        addRecentFile({
            id: `${file.name}-${file.size}`,
            name: file.name,
            type: "image",
            time: new Date().toISOString(),
            source: "ai-tools",
        });
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleAction = async (tool) => {
        if (!file)
            return;
        setError("");
        setActiveTool(tool);
        setIsLoading(true);
        try {
            setResultUrl(await runTool(file, tool, target));
            toast({ title: "AI tool applied", description: `${tools.find((item) => item.id === tool)?.label || "Tool"} result is ready.` });
        }
        catch {
            setError("Image process failed. Try another image.");
            toast({ title: "AI tool failed", description: "Try another image or a smaller file.", variant: "destructive" });
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleTarget = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTarget({
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
        });
    };

    const handleDownload = () => {
        if (!resultUrl)
            return;
        const link = document.createElement("a");
        link.href = resultUrl;
        link.download = `ai-${activeTool || "result"}.png`;
        link.click();
        addDownloadHistory({
            id: `${Date.now()}-${activeTool || "ai"}`,
            name: link.download,
            type: "image",
            time: new Date().toISOString(),
            source: "ai-tools",
        });
        toast({ title: "Download started", description: link.download });
    };

    return (<AppShell>
      <div className="grid gap-8">
        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-display text-3xl font-semibold">AI Image Tools</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Remove backgrounds, enhance clarity, and stylize images locally.
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">AI Enhancer Suite</h3>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <input type="file" accept="image/*" className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => setFile(event.target.files?.[0] || null)}/>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (<button key={tool.id} className={tool.primary
                        ? "rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                        : "rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground transition hover:bg-muted/60 disabled:opacity-50"} onClick={() => handleAction(tool.id)} disabled={!file || isLoading}>
                  {isLoading && activeTool === tool.id ? "Working..." : tool.label}
                </button>))}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                Object Remove uses the point selected in the preview.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-medium">Original</span>
                  {file && <span className="text-xs text-muted-foreground">{file.name}</span>}
                </div>
                {previewUrl ? (<button className="relative block w-full overflow-hidden rounded-lg bg-muted/30" onClick={handleTarget}>
                    <img src={previewUrl} alt="Original preview" className="w-full"/>
                    <span className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background/80" style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}/>
                  </button>) : (<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Upload an image.
                  </div>)}
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Result</span>
                  <button className="rounded-lg border border-border/60 p-2 text-muted-foreground transition hover:text-foreground disabled:opacity-40" onClick={handleDownload} disabled={!resultUrl}>
                    <Download className="h-4 w-4"/>
                  </button>
                </div>
                {resultUrl ? (<img src={resultUrl} alt="AI result" className="w-full rounded-lg"/>) : (<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Result preview appears here.
                  </div>)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>);
}
