"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import { useToast } from "@/hooks/use-toast";
import { useCompressionStore } from "../store/compression-store";
import { analyzeImage } from "../services/image-analysis";
import { compressImage } from "../services/compression-engine";
import { getFormatRecommendation, estimateSavings } from "../services/recommendations";
import { dataUrlToBlob } from "../services/image-io";
import { getExtensionForMime, sanitizeFileName, supportedFormats } from "../utils/file";
import { UploadPanel } from "./UploadPanel";
import { SettingsPanel } from "./SettingsPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { ComparisonPanel } from "./ComparisonPanel";
import { CompressionQueue } from "./CompressionQueue";
import { useClipboardPaste } from "../hooks/useClipboardPaste";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const buildItem = async (file) => {
  let analysis = null;
  try {
    analysis = await analyzeImage(file);
  } catch {
    analysis = { width: 0, height: 0, isTransparent: false, isPhoto: false, isIllustration: false, isScreenshot: false };
  }
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    originalSize: file.size,
    width: analysis.width,
    height: analysis.height,
    format: file.type,
    analysis,
    recommendation: getFormatRecommendation(analysis),
    resultBlob: null,
    resultUrl: null,
    resultSize: 0,
    resultFormat: null,
    savings: 0,
    status: "idle",
    error: "",
  };
};

const buildDownloadName = (item) => {
  const extension = getExtensionForMime(item.resultFormat || item.format);
  return `${sanitizeFileName(item.file.name)}-optimized.${extension}`;
};

export const CompressionDashboard = () => {
  const { toast } = useToast();
  const settings = useCompressionStore((state) => state.settings);
  const items = useCompressionStore((state) => state.items);
  const selectedId = useCompressionStore((state) => state.selectedId);
  const addItems = useCompressionStore((state) => state.addItems);
  const updateItem = useCompressionStore((state) => state.updateItem);
  const removeItem = useCompressionStore((state) => state.removeItem);
  const setSelectedId = useCompressionStore((state) => state.setSelectedId);
  const undo = useCompressionStore((state) => state.undo);
  const redo = useCompressionStore((state) => state.redo);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useClipboardPaste(async (files) => {
    await handleFiles(files);
  });

  const handleFiles = useCallback(async (files) => {
    const maxSize = 30 * 1024 * 1024;
    const fileArray = Array.from(files || []).filter((file) => supportedFormats.includes(file.type));
    const valid = fileArray.filter((file) => file.size <= maxSize);
    if (!valid.length) {
      toast({ title: "Unsupported files", description: "Upload JPG, PNG, WEBP, AVIF or SVG under 30MB.", variant: "destructive" });
      return;
    }
    if (valid.length !== fileArray.length) {
      toast({ title: "Some files skipped", description: "Large files over 30MB were ignored.", variant: "destructive" });
    }
    const entries = await Promise.all(valid.map(buildItem));
    addItems(entries);
  }, [addItems, toast]);

  const processItem = useCallback(async (itemId) => {
    const current = itemsRef.current.find((entry) => entry.id === itemId);
    if (!current) return;
    updateItem(itemId, { status: "processing", error: "" });
    try {
      const { blob, width, height } = await compressImage({ file: current.file, settings, analysis: current.analysis });
      if (current.resultUrl) {
        URL.revokeObjectURL(current.resultUrl);
      }
      const resultUrl = URL.createObjectURL(blob);
      const resultSize = blob.size;
      const savings = estimateSavings({ originalSize: current.originalSize, compressedSize: resultSize });
      updateItem(itemId, {
        status: "done",
        resultBlob: blob,
        resultUrl,
        resultSize,
        resultFormat: blob.type,
        width,
        height,
        savings,
      });
    } catch (error) {
      updateItem(itemId, { status: "error", error: error?.message || "Compression failed" });
    }
  }, [settings, updateItem]);

  const processAll = useCallback(async () => {
    if (!itemsRef.current.length) return;
    setIsBatchProcessing(true);
    for (const item of itemsRef.current) {
      // eslint-disable-next-line no-await-in-loop
      await processItem(item.id);
    }
    setIsBatchProcessing(false);
    toast({ title: "Compression complete", description: "All images are optimized." });
  }, [processItem, toast]);

  const downloadItem = useCallback((item) => {
    if (!item.resultUrl) return;
    const link = document.createElement("a");
    link.href = item.resultUrl;
    link.download = buildDownloadName(item);
    link.click();
  }, []);

  const downloadAll = useCallback(async () => {
    const ready = itemsRef.current.filter((item) => item.resultUrl);
    if (!ready.length) return;
    const zip = new JSZip();
    await Promise.all(ready.map(async (item) => {
      const blob = item.resultBlob || (await dataUrlToBlob(item.resultUrl));
      zip.file(buildDownloadName(item), blob);
    }));
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ef-optimized-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  useKeyboardShortcuts({ onUndo: undo, onRedo: redo, onDownloadAll: downloadAll });

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId) || items[0] || null, [items, selectedId]);

  useEffect(() => {
    if (!selectedItem || !settings.livePreview || isBatchProcessing || selectedItem.status === "processing") return;
    const timer = setTimeout(() => {
      processItem(selectedItem.id);
    }, 800);
    return () => clearTimeout(timer);
  }, [settings, selectedItem?.id, selectedItem?.status, isBatchProcessing, processItem]);

  useEffect(() => {
    if (selectedItem && selectedId !== selectedItem.id) {
      setSelectedId(selectedItem.id);
    }
  }, [selectedItem, selectedId, setSelectedId]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
  }, []);

  const overallStats = useMemo(() => {
    const originals = items.reduce((sum, item) => sum + item.originalSize, 0);
    const optimized = items.reduce((sum, item) => sum + (item.resultSize || 0), 0);
    const savings = estimateSavings({ originalSize: originals, compressedSize: optimized || originals });
    return { originals, optimized, savings };
  }, [items]);

  return (
    <div className="grid gap-6">
      <motion.section
        className="glass-card rounded-2xl p-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Smart Image Compression & Optimization</p>
        <h2 className="mt-1 text-display text-xl font-semibold">Compress, convert, and optimize images with precision.</h2>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Upload multiple images, tune quality, compare results, and export optimized assets instantly. Everything happens in your browser for privacy.
        </p>
      </motion.section>

      <div className="grid gap-5">
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr] auto-rows-fr">
          <UploadPanel onFiles={handleFiles} isProcessing={isBatchProcessing} />
          <AnalyticsPanel
            item={selectedItem}
            totalOriginal={overallStats.originals}
            totalOptimized={overallStats.optimized}
            savings={overallStats.savings}
          />
        </div>
        <SettingsPanel onProcessAll={processAll} isBatchProcessing={isBatchProcessing} onDownloadAll={downloadAll} />
        <CompressionQueue
          items={items}
          selectedId={selectedItem?.id}
          onSelect={setSelectedId}
          onRemove={removeItem}
          onCompress={processItem}
          onDownload={downloadItem}
          onReorder={(fromIndex, toIndex) => useCompressionStore.getState().reorderItems(fromIndex, toIndex)}
        />
        <ComparisonPanel item={selectedItem} onCompress={() => selectedItem && processItem(selectedItem.id)} />
      </div>

      <AnimatePresence>
        {!items.length && (
          <motion.div
            className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Drop images here or use the upload panel to start optimizing.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-3 text-xs text-muted-foreground">
        <p><span className="font-semibold text-foreground">Shortcuts:</span> Cmd/Ctrl+S download all, Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z redo.</p>
        <p><span className="font-semibold text-foreground">Batch mode:</span> Smart compression uses web workers and never uploads images.</p>
      </div>
    </div>
  );
};
