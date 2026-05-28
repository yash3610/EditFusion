"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Upload, Download, ImageIcon, ChevronDown } from "lucide-react";
export function Header({ onLoadImage, onExport, hasImage, imageInfo, }) {
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            onLoadImage(file);
        }
        e.target.value = "";
    };
    return (<header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <ImageIcon className="h-4 w-4 text-primary-foreground"/>
          </div>
          <h1 className="text-lg font-semibold text-foreground">EditFusion</h1>
        </div>
        {imageInfo && (<div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <span className="rounded bg-secondary px-2 py-0.5">
              {imageInfo.width} × {imageInfo.height}
            </span>
          </div>)}
      </div>

      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4"/>
          Upload
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={!hasImage}>
              <Download className="mr-2 h-4 w-4"/>
              Export
              <ChevronDown className="ml-2 h-3 w-3"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("png")}>
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("jpeg", 0.92)}>
              Export as JPEG (High Quality)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("jpeg", 0.7)}>
              Export as JPEG (Medium Quality)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport("webp", 0.9)}>
              Export as WebP
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>);
}
