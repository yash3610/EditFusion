"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { API_URL } from "@/lib/api";
import { ArrowDownToLine, Repeat } from "lucide-react";
import { addDownloadHistory, addRecentFile } from "@/lib/history";
const downloadDataUrl = (dataUrl, filename) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
};
export default function ConverterPage() {
    const [file, setFile] = useState(null);
    const [format, setFormat] = useState("png");
    const [docFile, setDocFile] = useState(null);
    const [docType, setDocType] = useState("docx");
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfTarget, setPdfTarget] = useState("docx");
    const [batchFiles, setBatchFiles] = useState([]);
    const [batchTarget, setBatchTarget] = useState("pdf");
    const handleConvert = async () => {
        if (!file)
            return;
        const output = await convertImage(file, format);
        if (!output)
            return;
        downloadDataUrl(output, `converted.${format}`);
        addDownloadHistory({
            id: `${Date.now()}-${format}`,
            name: `converted.${format}`,
            type: format,
            time: new Date().toISOString(),
            source: "converter",
        });
    };
    const handleDocConvert = async () => {
        if (!docFile)
            return;
        const formData = new FormData();
        formData.append("file", docFile);
        const token = localStorage.getItem("ef_token");
        const response = await fetch(`${API_URL}/api/convert/${docType}`, {
            method: "POST",
            body: formData,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok)
            return;
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${docFile.name.replace(/\.[^.]+$/, "")}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        addDownloadHistory({
            id: `${Date.now()}-${docType}`,
            name: `${docFile.name.replace(/\.[^.]+$/, "")}.pdf`,
            type: "pdf",
            time: new Date().toISOString(),
            source: "converter",
        });
    };
    const handlePdfConvert = async () => {
        if (!pdfFile)
            return;
        const formData = new FormData();
        formData.append("file", pdfFile);
        const token = localStorage.getItem("ef_token");
        const response = await fetch(`${API_URL}/api/convert/pdf-to/${pdfTarget}`, {
            method: "POST",
            body: formData,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok)
            return;
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${pdfFile.name.replace(/\.[^.]+$/, "")}.${pdfTarget}`;
        link.click();
        URL.revokeObjectURL(url);
        addDownloadHistory({
            id: `${Date.now()}-${pdfTarget}`,
            name: `${pdfFile.name.replace(/\.[^.]+$/, "")}.${pdfTarget}`,
            type: pdfTarget,
            time: new Date().toISOString(),
            source: "converter",
        });
    };
    const handleBatchConvert = async () => {
        if (batchFiles.length === 0)
            return;
        const formData = new FormData();
        batchFiles.forEach((fileItem) => formData.append("files", fileItem));
        formData.append("target", batchTarget);
        const token = localStorage.getItem("ef_token");
        const response = await fetch(`${API_URL}/api/convert/batch`, {
            method: "POST",
            body: formData,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok)
            return;
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "converted.zip";
        link.click();
        URL.revokeObjectURL(url);
        addDownloadHistory({
            id: `${Date.now()}-batch-${batchTarget}`,
            name: "converted.zip",
            type: "zip",
            time: new Date().toISOString(),
            source: "converter",
        });
    };
    return (_jsx(AppShell, { children: _jsxs("div", { className: "grid gap-8", children: [_jsxs("section", { className: "glass-card rounded-3xl p-8", children: [_jsx("h2", { className: "text-display text-3xl font-semibold", children: "File Converter" }), _jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Convert image formats instantly with high-quality output." })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Repeat, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Image Converter" })] }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]", children: [_jsx("input", { type: "file", accept: "image/*,image/svg+xml", className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                        const nextFile = event.target.files?.[0] || null;
                                        setFile(nextFile);
                                        if (nextFile) {
                                            addRecentFile({
                                                id: `${nextFile.name}-${nextFile.size}`,
                                                name: nextFile.name,
                                                type: "image",
                                                time: new Date().toISOString(),
                                                source: "converter",
                                            });
                                        }
                                    } }), _jsxs("select", { value: format, onChange: (event) => setFormat(event.target.value), className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", children: [_jsx("option", { value: "png", children: "PNG" }), _jsx("option", { value: "jpeg", children: "JPG" }), _jsx("option", { value: "webp", children: "WebP" })] }), _jsxs("button", { className: "flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: handleConvert, children: [_jsx(ArrowDownToLine, { className: "h-4 w-4" }), "Convert"] })] }), _jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Supports JPG, PNG, WebP, and SVG inputs. SVG exports render to PNG/WebP/JPG." })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Repeat, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Document to PDF" })] }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]", children: [_jsx("input", { type: "file", accept: ".docx,.pptx,.xlsx", className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                        const nextFile = event.target.files?.[0] || null;
                                        setDocFile(nextFile);
                                        if (nextFile) {
                                            addRecentFile({
                                                id: `${nextFile.name}-${nextFile.size}`,
                                                name: nextFile.name,
                                                type: "document",
                                                time: new Date().toISOString(),
                                                source: "converter",
                                            });
                                        }
                                    } }), _jsxs("select", { value: docType, onChange: (event) => setDocType(event.target.value), className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", children: [_jsx("option", { value: "docx", children: "Word to PDF" }), _jsx("option", { value: "pptx", children: "PPT to PDF" }), _jsx("option", { value: "xlsx", children: "Excel to PDF" })] }), _jsxs("button", { className: "flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: handleDocConvert, children: [_jsx(ArrowDownToLine, { className: "h-4 w-4" }), "Convert"] })] }), _jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Requires LibreOffice on the server for reliable conversion." })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Repeat, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "PDF to Office" })] }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]", children: [_jsx("input", { type: "file", accept: "application/pdf", className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                        const nextFile = event.target.files?.[0] || null;
                                        setPdfFile(nextFile);
                                        if (nextFile) {
                                            addRecentFile({
                                                id: `${nextFile.name}-${nextFile.size}`,
                                                name: nextFile.name,
                                                type: "pdf",
                                                time: new Date().toISOString(),
                                                source: "converter",
                                            });
                                        }
                                    } }), _jsxs("select", { value: pdfTarget, onChange: (event) => setPdfTarget(event.target.value), className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", children: [_jsx("option", { value: "docx", children: "PDF to Word" }), _jsx("option", { value: "pptx", children: "PDF to PPT" }), _jsx("option", { value: "xlsx", children: "PDF to Excel" })] }), _jsxs("button", { className: "flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: handlePdfConvert, children: [_jsx(ArrowDownToLine, { className: "h-4 w-4" }), "Convert"] })] })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Repeat, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Batch Converter" })] }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]", children: [_jsx("input", { type: "file", multiple: true, accept: ".docx,.pptx,.xlsx,application/pdf", className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => setBatchFiles(Array.from(event.target.files || [])) }), _jsxs("select", { value: batchTarget, onChange: (event) => setBatchTarget(event.target.value), className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", children: [_jsx("option", { value: "pdf", children: "Office \u2192 PDF" }), _jsx("option", { value: "docx", children: "PDF \u2192 Word" }), _jsx("option", { value: "pptx", children: "PDF \u2192 PPT" }), _jsx("option", { value: "xlsx", children: "PDF \u2192 Excel" })] }), _jsxs("button", { className: "flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: handleBatchConvert, children: [_jsx(ArrowDownToLine, { className: "h-4 w-4" }), "Convert Batch"] })] }), _jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Batch conversion returns a ZIP file with all converted documents." })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Repeat, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Coming soon" })] }), _jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-3", children: [
                                "Video converter",
                                "Audio converter",
                                "GIF maker",
                            ].map((item) => (_jsxs("div", { className: "rounded-xl border border-border/60 bg-background/60 p-4", children: [_jsx("p", { className: "text-sm font-semibold", children: item }), _jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Scaffolded for future rollouts." })] }, item))) })] })] }) }));
}
const convertImage = (file, format) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const dataUrl = reader.result;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx)
                    return resolve(null);
                ctx.drawImage(img, 0, 0);
                const output = canvas.toDataURL(`image/${format}`, 0.92);
                resolve(output);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    });
};
