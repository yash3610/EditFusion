"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("header", { className: "flex h-14 items-center justify-between border-b border-border bg-card px-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-md bg-primary", children: _jsx(ImageIcon, { className: "h-4 w-4 text-primary-foreground" }) }), _jsx("h1", { className: "text-lg font-semibold text-foreground", children: "EditFusion" })] }), imageInfo && (_jsx("div", { className: "hidden items-center gap-2 text-sm text-muted-foreground md:flex", children: _jsxs("span", { className: "rounded bg-secondary px-2 py-0.5", children: [imageInfo.width, " \u00D7 ", imageInfo.height] }) }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileChange, className: "hidden" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => fileInputRef.current?.click(), children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Upload"] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", disabled: !hasImage, children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Export", _jsx(ChevronDown, { className: "ml-2 h-3 w-3" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { onClick: () => onExport("png"), children: "Export as PNG" }), _jsx(DropdownMenuItem, { onClick: () => onExport("jpeg", 0.92), children: "Export as JPEG (High Quality)" }), _jsx(DropdownMenuItem, { onClick: () => onExport("jpeg", 0.7), children: "Export as JPEG (Medium Quality)" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { onClick: () => onExport("webp", 0.9), children: "Export as WebP" })] })] })] })] }));
}
