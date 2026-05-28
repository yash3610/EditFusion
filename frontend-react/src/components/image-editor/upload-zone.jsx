"use client";
import { useCallback, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
export function UploadZone({ onUpload }) {
    const [isDragging, setIsDragging] = useState(false);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            onUpload(file);
        }
    }, [onUpload]);
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            onUpload(file);
        }
    }, [onUpload]);
    return (<div className="flex h-full items-center justify-center p-8">
      <label className={`relative flex h-80 w-full max-w-xl cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-muted-foreground/50 hover:bg-secondary/30"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 cursor-pointer opacity-0"/>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            {isDragging ? (<Upload className="h-8 w-8 text-primary"/>) : (<ImageIcon className="h-8 w-8 text-muted-foreground"/>)}
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              {isDragging ? "Drop your image here" : "Drag & drop an image"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded bg-secondary px-2 py-1">PNG</span>
            <span className="rounded bg-secondary px-2 py-1">JPG</span>
            <span className="rounded bg-secondary px-2 py-1">GIF</span>
            <span className="rounded bg-secondary px-2 py-1">WebP</span>
          </div>
        </div>
      </label>
    </div>);
}
