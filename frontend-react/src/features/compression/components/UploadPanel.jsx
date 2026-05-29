"use client";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Clipboard, Layers } from "lucide-react";
import { supportedFormats } from "../utils/file";

export const UploadPanel = ({ onFiles, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length) onFiles(files);
  }, [onFiles]);

  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    if (files.length) onFiles(files);
    event.target.value = "";
  }, [onFiles]);

  return (
    <motion.section
      className="glass-card h-full min-h-[420px] rounded-2xl border border-border/60 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Upload images</p>
          <p className="text-xs text-muted-foreground">Drag, drop, paste, or browse. Multi-upload supported.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>{supportedFormats.map((format) => format.split("/")[1].toUpperCase()).join(" · ")}</span>
        </div>
      </div>

      <label
        className={`mt-4 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition ${
          isDragging ? "border-primary bg-primary/10" : "border-border/60 bg-muted/20 hover:bg-muted/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input type="file" accept={supportedFormats.join(",")} multiple className="hidden" onChange={handleFileSelect} />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          {isDragging ? <UploadCloud className="h-6 w-6 text-primary" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">Drop images here</p>
        <p className="mt-2 text-xs text-muted-foreground">or click to browse</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2 rounded-full border border-border/50 px-3 py-1">
            <Clipboard className="h-3 w-3" /> Paste supported
          </span>
          <span className="flex items-center gap-2 rounded-full border border-border/50 px-3 py-1">
            <UploadCloud className="h-3 w-3" /> Batch uploads
          </span>
        </div>
        {isProcessing && <p className="mt-4 text-xs text-primary">Processing queue...</p>}
      </label>
    </motion.section>
  );
};
