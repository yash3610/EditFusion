"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PDFDocument, degrees, rgb } from "pdf-lib";
import { addDownloadHistory, addRecentFile } from "@/lib/history";
import { ArrowDownToLine, ArrowUp, ArrowDown, FileText, RotateCw, Scissors, Trash2, } from "lucide-react";
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};
export default function PdfToolsPage() {
    const [mergeFiles, setMergeFiles] = useState([]);
    const [splitFile, setSplitFile] = useState(null);
    const [splitRange, setSplitRange] = useState("1-1");
    const [rotateFile, setRotateFile] = useState(null);
    const [rotatePage, setRotatePage] = useState(1);
    const [rotateDegrees, setRotateDegrees] = useState(90);
    const [deleteFile, setDeleteFile] = useState(null);
    const [deletePages, setDeletePages] = useState("1");
    const [viewerFile, setViewerFile] = useState(null);
    const [compressFile, setCompressFile] = useState(null);
    const [compressScale, setCompressScale] = useState(0.9);
    const [compressQuality, setCompressQuality] = useState(0.8);
    const [annotateFile, setAnnotateFile] = useState(null);
    const [annotatePage, setAnnotatePage] = useState(1);
    const [annotateText, setAnnotateText] = useState("Approved by EditFusion");
    const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
    const [highlightColor, setHighlightColor] = useState("#fde047");
    const [signatureFile, setSignatureFile] = useState(null);
    const [drawColor, setDrawColor] = useState("#22d3ee");
    const drawCanvasRef = useRef(null);
    const [reorderFile, setReorderFile] = useState(null);
    const [reorderPages, setReorderPages] = useState([]);
    const [thumbnails, setThumbnails] = useState([]);
    const recordRecent = (file, source) => {
        if (!file)
            return;
        addRecentFile({
            id: `${file.name}-${file.size}`,
            name: file.name,
            type: "pdf",
            time: new Date().toISOString(),
            source,
        });
    };
    useEffect(() => {
        if (!reorderFile)
            return;
        const load = async () => {
            const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
            const pdf = await pdfjsLib.getDocument({
                data: await reorderFile.arrayBuffer(),
            }).promise;
            const nextThumbs = [];
            for (let i = 1; i <= pdf.numPages; i += 1) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.25 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (!context)
                    continue;
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: context, viewport }).promise;
                nextThumbs.push(canvas.toDataURL("image/png"));
            }
            setThumbnails(nextThumbs);
            setReorderPages(Array.from({ length: nextThumbs.length }, (_, idx) => idx));
        };
        load();
    }, [reorderFile]);
    const handleMerge = async () => {
        if (mergeFiles.length < 2)
            return;
        const merged = await PDFDocument.create();
        for (const file of mergeFiles) {
            const bytes = await file.arrayBuffer();
            const doc = await PDFDocument.load(bytes);
            const pages = await merged.copyPages(doc, doc.getPageIndices());
            pages.forEach((page) => merged.addPage(page));
        }
        const pdfBytes = await merged.save();
        downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "merged.pdf");
        addDownloadHistory({
            id: `${Date.now()}-merged`,
            name: "merged.pdf",
            type: "pdf",
            time: new Date().toISOString(),
            source: "pdf-tools",
        });
    };
    const handleSplit = async () => {
        if (!splitFile)
            return;
        const [start, end] = splitRange
            .split("-")
            .map((value) => Number.parseInt(value.trim(), 10));
        if (!start || !end || start > end)
            return;
        const bytes = await splitFile.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const output = await PDFDocument.create();
        const pages = await output.copyPages(doc, doc.getPageIndices().slice(start - 1, end));
        pages.forEach((page) => output.addPage(page));
        const pdfBytes = await output.save();
        downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "split.pdf");
        addDownloadHistory({
            id: `${Date.now()}-split`,
            name: "split.pdf",
            type: "pdf",
            time: new Date().toISOString(),
            source: "pdf-tools",
        });
    };
    const handleRotate = async () => {
        if (!rotateFile)
            return;
        const bytes = await rotateFile.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const page = doc.getPage(rotatePage - 1);
        if (!page)
            return;
        page.setRotation(degrees(rotateDegrees));
        const pdfBytes = await doc.save();
        downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "rotated.pdf");
        addDownloadHistory({
            id: `${Date.now()}-rotated`,
            name: "rotated.pdf",
            type: "pdf",
            time: new Date().toISOString(),
            source: "pdf-tools",
        });
    };
    const handleDelete = async () => {
        if (!deleteFile)
            return;
        const pagesToDelete = deletePages
            .split(",")
            .map((value) => Number.parseInt(value.trim(), 10) - 1)
            .filter((value) => value >= 0);
        const bytes = await deleteFile.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        pagesToDelete
            .sort((a, b) => b - a)
            .forEach((pageIndex) => {
            if (pageIndex < doc.getPageCount()) {
                doc.removePage(pageIndex);
            }
        });
        const pdfBytes = await doc.save();
        downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "cleaned.pdf");
        addDownloadHistory({
            id: `${Date.now()}-cleaned`,
            name: "cleaned.pdf",
            type: "pdf",
            time: new Date().toISOString(),
            source: "pdf-tools",
        });
    };
    return (_jsx(AppShell, { children: _jsxs("div", { className: "grid gap-8", children: [_jsxs("div", { className: "glass-card rounded-3xl p-8", children: [_jsx("h2", { className: "text-display text-3xl font-semibold", children: "PDF Studio" }), _jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Merge, split, rotate, and clean PDFs instantly. Drag-and-drop works across every tool." })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Merge PDFs" })] }), _jsx("input", { type: "file", accept: "application/pdf", multiple: true, className: "mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                        const files = Array.from(event.target.files || []);
                                        setMergeFiles(files);
                                        files.forEach((file) => recordRecent(file, "merge"));
                                    } }), _jsx("button", { className: "mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: handleMerge, children: "Merge & Download" })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Scissors, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Split PDF" })] }), _jsx("input", { type: "file", accept: "application/pdf", className: "mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                        const file = event.target.files?.[0] || null;
                                        setSplitFile(file);
                                        recordRecent(file, "split");
                                    } }), _jsx("input", { type: "text", value: splitRange, onChange: (event) => setSplitRange(event.target.value), className: "mt-3 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", placeholder: "1-3" }), _jsx("button", { className: "mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: handleSplit, children: "Split & Download" })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(RotateCw, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Rotate Page" })] }), _jsx("input", { type: "file", accept: "application/pdf", className: "mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                        const file = event.target.files?.[0] || null;
                                        setRotateFile(file);
                                        recordRecent(file, "rotate");
                                    } }), _jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3", children: [_jsx("input", { type: "number", min: 1, value: rotatePage, onChange: (event) => setRotatePage(Number(event.target.value)), className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", placeholder: "Page" }), _jsx("input", { type: "number", min: 0, step: 90, value: rotateDegrees, onChange: (event) => setRotateDegrees(Number(event.target.value)), className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", placeholder: "Degrees" })] }), _jsx("button", { className: "mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: handleRotate, children: "Rotate & Download" })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Trash2, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Delete Pages" })] }), _jsx("input", { type: "file", accept: "application/pdf", className: "mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                        const file = event.target.files?.[0] || null;
                                        setDeleteFile(file);
                                        recordRecent(file, "delete");
                                    } }), _jsx("input", { type: "text", value: deletePages, onChange: (event) => setDeletePages(event.target.value), className: "mt-3 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", placeholder: "1,3,5" }), _jsx("button", { className: "mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: handleDelete, children: "Delete & Download" })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ArrowDownToLine, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Compress PDF" })] }), _jsx("input", { type: "file", accept: "application/pdf", className: "mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                        const file = event.target.files?.[0] || null;
                                        setCompressFile(file);
                                        recordRecent(file, "compress");
                                    } }), _jsxs("div", { className: "mt-4 grid gap-3", children: [_jsx("label", { className: "text-xs text-muted-foreground", children: "Scale" }), _jsx("input", { type: "range", min: 0.5, max: 1, step: 0.1, value: compressScale, onChange: (event) => setCompressScale(Number(event.target.value)) }), _jsx("label", { className: "text-xs text-muted-foreground", children: "Quality" }), _jsx("input", { type: "range", min: 0.4, max: 1, step: 0.1, value: compressQuality, onChange: (event) => setCompressQuality(Number(event.target.value)) })] }), _jsx("button", { className: "mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: () => compressPdf({
                                        file: compressFile,
                                        scale: compressScale,
                                        quality: compressQuality,
                                    }), children: "Compress & Download" })] })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Rearrange Pages" })] }), _jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-[0.4fr_0.6fr]", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("input", { type: "file", accept: "application/pdf", className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                                const file = event.target.files?.[0] || null;
                                                setReorderFile(file);
                                                recordRecent(file, "reorder");
                                            } }), _jsx("button", { className: "w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: () => reorderPdf({ file: reorderFile, order: reorderPages }), children: "Export reordered PDF" })] }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3", children: reorderPages.length === 0 ? (_jsx("div", { className: "text-sm text-muted-foreground", children: "Upload a PDF to preview pages." })) : (reorderPages.map((pageIndex, position) => (_jsxs("div", { className: "rounded-xl border border-border/60 bg-background/60 p-3", children: [_jsx("img", { src: thumbnails[pageIndex], alt: `Page ${pageIndex + 1}`, className: "w-full rounded-lg" }), _jsxs("div", { className: "mt-2 flex items-center justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Page ", pageIndex + 1] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { className: "rounded border border-border/60 p-1", onClick: () => movePage(position, position - 1, reorderPages, setReorderPages), children: _jsx(ArrowUp, { className: "h-3 w-3" }) }), _jsx("button", { className: "rounded border border-border/60 p-1", onClick: () => movePage(position, position + 1, reorderPages, setReorderPages), children: _jsx(ArrowDown, { className: "h-3 w-3" }) })] })] })] }, `${pageIndex}-${position}`)))) })] })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Annotate & Sign" })] }), _jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-[0.6fr_0.4fr]", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("input", { type: "file", accept: "application/pdf", className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                                const file = event.target.files?.[0] || null;
                                                setAnnotateFile(file);
                                                recordRecent(file, "annotate");
                                            } }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { type: "number", min: 1, value: annotatePage, onChange: (event) => setAnnotatePage(Number(event.target.value)), className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm", placeholder: "Page" }), _jsx("input", { type: "color", value: highlightColor, onChange: (event) => setHighlightColor(event.target.value), className: "h-10 rounded-lg border border-border/60 bg-background/60 p-1" })] }), _jsx("input", { type: "text", value: annotateText, onChange: (event) => setAnnotateText(event.target.value), className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", placeholder: "Text annotation" }), _jsx("input", { type: "text", value: watermarkText, onChange: (event) => setWatermarkText(event.target.value), className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", placeholder: "Watermark" }), _jsx("input", { type: "file", accept: "image/*", className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => setSignatureFile(event.target.files?.[0] || null) }), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-xs text-muted-foreground", children: "Draw signature" }), _jsx("canvas", { ref: drawCanvasRef, width: 360, height: 140, className: "w-full rounded-lg border border-border/60 bg-background/60", onMouseDown: (event) => startDraw(event, drawCanvasRef, drawColor), onMouseMove: (event) => draw(event, drawCanvasRef, drawColor), onMouseUp: () => stopDraw(drawCanvasRef), onMouseLeave: () => stopDraw(drawCanvasRef) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "color", value: drawColor, onChange: (event) => setDrawColor(event.target.value), className: "h-8 w-10 rounded border border-border/60" }), _jsx("button", { className: "rounded-lg border border-border/60 px-3 py-2 text-xs", onClick: () => clearDraw(drawCanvasRef), children: "Clear" })] })] })] }), _jsxs("div", { className: "space-y-3 text-sm text-muted-foreground", children: [_jsx("p", { children: "Apply quick annotations to the selected page." }), _jsxs("div", { className: "grid gap-2", children: [_jsx("button", { className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", onClick: () => annotatePdf({
                                                        file: annotateFile,
                                                        pageNumber: annotatePage,
                                                        text: annotateText,
                                                        watermark: watermarkText,
                                                        highlightColor,
                                                        signatureFile,
                                                        drawCanvas: drawCanvasRef.current,
                                                    }), children: "Apply annotations & Download" }), _jsx("p", { className: "text-xs", children: "Watermark, highlight, signature, and text will be added in one export." })] })] })] })] }), _jsx(PdfViewer, { file: viewerFile, onFileChange: setViewerFile })] }) }));
}
let isDrawing = false;
const startDraw = (event, canvasRef, color) => {
    const canvas = canvasRef.current;
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    isDrawing = true;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
};
const draw = (event, canvasRef, color) => {
    if (!isDrawing)
        return;
    const canvas = canvasRef.current;
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    ctx.strokeStyle = color;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
};
const stopDraw = (canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    isDrawing = false;
    ctx.closePath();
};
const clearDraw = (canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};
const annotatePdf = async ({ file, pageNumber, text, watermark, highlightColor, signatureFile, drawCanvas, }) => {
    if (!file)
        return;
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const page = doc.getPage(pageNumber - 1);
    if (!page)
        return;
    const { width, height } = page.getSize();
    page.drawText(text, {
        x: 40,
        y: height - 60,
        size: 18,
        color: hexToRgb(highlightColor),
    });
    page.drawText(watermark, {
        x: width / 2 - watermark.length * 6,
        y: height / 2,
        size: 36,
        color: hexToRgb("#94a3b8"),
        opacity: 0.25,
        rotate: degrees(25),
    });
    page.drawRectangle({
        x: 40,
        y: height - 120,
        width: width - 80,
        height: 30,
        color: hexToRgb(highlightColor),
        opacity: 0.35,
    });
    if (signatureFile) {
        const sigBytes = await signatureFile.arrayBuffer();
        const sigImage = signatureFile.type.includes("png")
            ? await doc.embedPng(sigBytes)
            : await doc.embedJpg(sigBytes);
        const sigDims = sigImage.scale(0.3);
        page.drawImage(sigImage, {
            x: width - sigDims.width - 50,
            y: 40,
            width: sigDims.width,
            height: sigDims.height,
        });
    }
    if (drawCanvas) {
        const drawnUrl = drawCanvas.toDataURL("image/png");
        const drawnBytes = await fetch(drawnUrl).then((res) => res.arrayBuffer());
        const drawnImage = await doc.embedPng(drawnBytes);
        const drawnDims = drawnImage.scale(0.5);
        page.drawImage(drawnImage, {
            x: 40,
            y: 80,
            width: drawnDims.width,
            height: drawnDims.height,
        });
    }
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "annotated.pdf");
    addDownloadHistory({
        id: `${Date.now()}-annotated`,
        name: "annotated.pdf",
        type: "pdf",
        time: new Date().toISOString(),
        source: "pdf-tools",
    });
};
const reorderPdf = async ({ file, order, }) => {
    if (!file || order.length === 0)
        return;
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const output = await PDFDocument.create();
    const pages = await output.copyPages(doc, order);
    pages.forEach((page) => output.addPage(page));
    const pdfBytes = await output.save();
    downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "reordered.pdf");
    addDownloadHistory({
        id: `${Date.now()}-reordered`,
        name: "reordered.pdf",
        type: "pdf",
        time: new Date().toISOString(),
        source: "pdf-tools",
    });
};
const movePage = (from, to, order, setOrder) => {
    if (to < 0 || to >= order.length)
        return;
    const updated = [...order];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    setOrder(updated);
};
const compressPdf = async ({ file, scale, quality, }) => {
    if (!file)
        return;
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    const input = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const output = await PDFDocument.create();
    for (let i = 1; i <= input.numPages; i += 1) {
        const page = await input.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context)
            continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const imgBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
        const image = await output.embedJpg(imgBytes);
        const newPage = output.addPage([viewport.width, viewport.height]);
        newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
        });
    }
    const pdfBytes = await output.save();
    downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "compressed.pdf");
    addDownloadHistory({
        id: `${Date.now()}-compressed`,
        name: "compressed.pdf",
        type: "pdf",
        time: new Date().toISOString(),
        source: "pdf-tools",
    });
};
const hexToRgb = (hex) => {
    const sanitized = hex.replace("#", "");
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return rgb(r / 255, g / 255, b / 255);
};
function PdfViewer({ file, onFileChange, }) {
    const canvasRef = useRef(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.1);
    const [pageCount, setPageCount] = useState(0);
    useEffect(() => {
        if (!file)
            return;
        const render = async () => {
            const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setPageCount(pdf.numPages);
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale });
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const context = canvas.getContext("2d");
            if (!context)
                return;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
        };
        render();
    }, [file, pageNumber, scale]);
    return (_jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "PDF Viewer" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Preview and inspect pages." })] }), _jsxs("button", { className: "flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs", onClick: () => {
                            if (!file)
                                return;
                            downloadBlob(file, file.name);
                        }, children: [_jsx(ArrowDownToLine, { className: "h-4 w-4" }), "Download"] })] }), _jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-[0.3fr_0.7fr]", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("input", { type: "file", accept: "application/pdf", className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", onChange: (event) => {
                                    const file = event.target.files?.[0] || null;
                                    onFileChange(file);
                                    recordRecent(file, "viewer");
                                } }), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-xs text-muted-foreground", children: "Page" }), _jsx("input", { type: "number", min: 1, max: pageCount, value: pageNumber, onChange: (event) => setPageNumber(Number(event.target.value)), className: "rounded-lg border border-border/60 bg-background/60 p-2 text-sm" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-xs text-muted-foreground", children: "Zoom" }), _jsx("input", { type: "range", min: 0.6, max: 2, step: 0.1, value: scale, onChange: (event) => setScale(Number(event.target.value)), className: "w-full" })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: pageCount ? `${pageNumber} / ${pageCount} pages` : "Upload a PDF to preview" })] }), _jsx("div", { className: "overflow-auto rounded-xl border border-border/60 bg-background/60 p-4", children: _jsx("canvas", { ref: canvasRef, className: "mx-auto" }) })] })] }));
}
