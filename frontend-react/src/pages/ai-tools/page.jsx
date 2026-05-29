"use client";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { addDownloadHistory, addRecentFile } from "@/lib/history";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { Download, Sparkles, Trash2 } from "lucide-react";

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
    const [items, setItems] = useState([]);
    const [isBatchLoading, setIsBatchLoading] = useState(false);
    const [activeTool, setActiveTool] = useState(null);
    const [error, setError] = useState("");
    const itemsRef = useRef(items);

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    useEffect(() => () => {
        itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    }, []);

    const buildItem = (file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        resultUrl: null,
        isLoading: false,
        activeTool: null,
        error: "",
        target: { x: 0.5, y: 0.5 },
    });

    const handleFiles = (fileList) => {
        const selected = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
        if (!selected.length) {
            setError("Please select image files only.");
            return;
        }
        setError("");
        const newItems = selected.map(buildItem);
        setItems((prev) => [...newItems, ...prev]);
        newItems.forEach((item) => {
            addRecentFile({
                id: `${item.file.name}-${item.file.size}`,
                name: item.file.name,
                type: "image",
                time: new Date().toISOString(),
                source: "ai-tools",
            });
        });
    };

    const updateItem = (id, updater) => {
        setItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    };

    const getSafeBaseName = (name) => name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-");

    const getResultExtension = (dataUrl) => (dataUrl?.startsWith("data:image/png") ? "png" : "jpg");

    const handleAction = async (itemId, tool) => {
        const current = itemsRef.current.find((item) => item.id === itemId);
        if (!current)
            return;
        setError("");
        setActiveTool(tool);
        updateItem(itemId, (item) => ({ ...item, isLoading: true, activeTool: tool, error: "" }));
        try {
            const result = await runTool(current.file, tool, current.target);
            updateItem(itemId, (item) => ({ ...item, resultUrl: result, isLoading: false }));
            toast({ title: "AI tool applied", description: `${tools.find((entry) => entry.id === tool)?.label || "Tool"} ready for ${current.file.name}.` });
        }
        catch {
            updateItem(itemId, (item) => ({ ...item, isLoading: false, error: "Image process failed." }));
            toast({ title: "AI tool failed", description: "Try another image or a smaller file.", variant: "destructive" });
        }
    };

    const handleApplyAll = async (tool) => {
        const eligible = itemsRef.current.filter((item) => !item.isLoading);
        if (!eligible.length)
            return;
        setIsBatchLoading(true);
        setActiveTool(tool);
        setError("");
        for (const item of eligible) {
            // eslint-disable-next-line no-await-in-loop
            await handleAction(item.id, tool);
        }
        setIsBatchLoading(false);
    };

    const handleTarget = (itemId, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const nextTarget = {
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
        };
        updateItem(itemId, (item) => ({ ...item, target: nextTarget }));
    };

    const handleDownload = (item) => {
        if (!item.resultUrl)
            return;
        const link = document.createElement("a");
        const extension = getResultExtension(item.resultUrl);
        link.href = item.resultUrl;
        link.download = `${getSafeBaseName(item.file.name)}-${item.activeTool || activeTool || "result"}.${extension}`;
        link.click();
        addDownloadHistory({
            id: `${Date.now()}-${item.activeTool || "ai"}`,
            name: link.download,
            type: "image",
            time: new Date().toISOString(),
            source: "ai-tools",
        });
        toast({ title: "Download started", description: link.download });
    };

    const handleDownloadZip = async () => {
        const results = itemsRef.current.filter((item) => item.resultUrl);
        if (!results.length)
            return;
        const zip = new JSZip();
        await Promise.all(results.map(async (item) => {
            const extension = getResultExtension(item.resultUrl);
            const filename = `${getSafeBaseName(item.file.name)}-${item.activeTool || "result"}.${extension}`;
            const blob = await fetch(item.resultUrl).then((response) => response.blob());
            zip.file(filename, blob);
        }));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ai-results-${Date.now()}.zip`;
        link.click();
        URL.revokeObjectURL(url);
        addDownloadHistory({
            id: `${Date.now()}-ai-zip`,
            name: link.download,
            type: "zip",
            time: new Date().toISOString(),
            source: "ai-tools",
        });
        toast({ title: "ZIP download started", description: link.download });
    };

    const handleRemoveItem = (itemId) => {
        setItems((prev) => {
            const next = prev.filter((item) => item.id !== itemId);
            const removed = prev.find((item) => item.id === itemId);
            if (removed) {
                URL.revokeObjectURL(removed.previewUrl);
            }
            return next;
        });
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
                    <div className="mt-4 grid gap-6">
                        <div className="space-y-5">
                            <input type="file" accept="image/*" multiple className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
                                        handleFiles(event.target.files);
                                        event.target.value = "";
                                }}/>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded bg-secondary px-2 py-1">Multi-upload</span>
                                <span className="rounded bg-secondary px-2 py-1">PNG</span>
                                <span className="rounded bg-secondary px-2 py-1">JPG</span>
                                <span className="rounded bg-secondary px-2 py-1">WebP</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {tools.map((tool) => (<button key={tool.id} className={tool.primary
                                                ? "rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                                                : "rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground transition hover:bg-muted/60 disabled:opacity-50"} onClick={() => handleApplyAll(tool.id)} disabled={!items.length || isBatchLoading}>
                                    {isBatchLoading && activeTool === tool.id ? "Working..." : `${tool.label} • All`}
                                </button>))}
                            </div>
                            <button className="w-full rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground transition hover:bg-muted/60 disabled:opacity-50" onClick={handleDownloadZip} disabled={!items.some((item) => item.resultUrl)}>
                                Download ZIP
                            </button>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <p className="text-xs text-muted-foreground">
                                Object Remove uses the point you tap on each preview.
                            </p>
                        </div>
                        <div className="grid gap-4">
                            {items.length === 0 && (<div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
                                    Upload images to see previews.
                                </div>)}
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {items.map((item) => (<div key={item.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-foreground" title={item.file.name}>{item.file.name}</p>
                                            <p className="text-xs text-muted-foreground">{Math.round(item.file.size / 1024)} KB</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="rounded-lg border border-border/60 p-2 text-muted-foreground transition hover:text-foreground" onClick={() => handleRemoveItem(item.id)} aria-label="Remove">
                                                <Trash2 className="h-4 w-4"/>
                                            </button>
                                            <button className="rounded-lg border border-border/60 p-2 text-muted-foreground transition hover:text-foreground disabled:opacity-40" onClick={() => handleDownload(item)} disabled={!item.resultUrl}>
                                                <Download className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-4">
                                        <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original</p>
                                            <button className="relative block w-full overflow-hidden rounded-lg bg-muted/30" onClick={(event) => handleTarget(item.id, event)}>
                                                <img src={item.previewUrl} alt="Original preview" className="aspect-[4/3] w-full object-cover"/>
                                                <span className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background/80" style={{ left: `${item.target.x * 100}%`, top: `${item.target.y * 100}%` }}/>
                                            </button>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Result</p>
                                            {item.resultUrl ? (<img src={item.resultUrl} alt="AI result" className="aspect-[4/3] w-full rounded-lg object-cover"/>) : (<div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">
                                                    Result preview appears here.
                                                </div>)}
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-3">
                                        {tools.map((tool) => (<button key={tool.id} className={tool.primary
                                                        ? "rounded-lg bg-primary px-2.5 py-2 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
                                                        : "rounded-lg border border-border/60 px-2.5 py-2 text-[11px] text-foreground transition hover:bg-muted/60 disabled:opacity-50"} onClick={() => handleAction(item.id, tool.id)} disabled={item.isLoading}>
                                            {item.isLoading && item.activeTool === tool.id ? "Working..." : tool.label}
                                        </button>))}
                                    </div>
                                    {item.error && <p className="mt-3 text-sm text-destructive">{item.error}</p>}
                                </div>))}
                            </div>
                        </div>
                    </div>
                </section>
      </div>
    </AppShell>);
}
