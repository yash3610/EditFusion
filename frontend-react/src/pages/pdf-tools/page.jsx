"use client";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PDFDocument, degrees, rgb } from "pdf-lib";
import { addDownloadHistory, addRecentFile } from "@/lib/history";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownToLine, ArrowUp, ArrowDown, FileText, RotateCw, Scissors, Trash2, } from "lucide-react";
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};
const parsePageSelection = (value, pageCount) => {
    const pages = new Set();
    value.split(",").forEach((part) => {
        const trimmed = part.trim();
        if (!trimmed)
            return;
        const [startText, endText] = trimmed.split("-").map((item) => item.trim());
        const start = Number.parseInt(startText, 10);
        const end = endText ? Number.parseInt(endText, 10) : start;
        if (!Number.isInteger(start) || !Number.isInteger(end))
            return;
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(pageCount, Math.max(start, end));
        for (let page = min; page <= max; page += 1) {
            pages.add(page - 1);
        }
    });
    return Array.from(pages).sort((a, b) => a - b);
};
export default function PdfToolsPage() {
    const { toast } = useToast();
    const [mergeFiles, setMergeFiles] = useState([]);
    const [splitFile, setSplitFile] = useState(null);
    const [splitRange, setSplitRange] = useState("1-1");
    const [rotateFile, setRotateFile] = useState(null);
    const [rotatePages, setRotatePages] = useState("1");
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
        if (mergeFiles.length < 2) {
            toast({ title: "Select PDFs", description: "Choose at least two PDFs to merge.", variant: "destructive" });
            return;
        }
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
        toast({ title: "PDF merged", description: "merged.pdf download started." });
    };
    const handleSplit = async () => {
        if (!splitFile) {
            toast({ title: "Select a PDF", description: "Choose a PDF before splitting.", variant: "destructive" });
            return;
        }
        const [start, end] = splitRange
            .split("-")
            .map((value) => Number.parseInt(value.trim(), 10));
        if (!start || !end || start > end) {
            toast({ title: "Invalid range", description: "Use a range like 1-3.", variant: "destructive" });
            return;
        }
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
        toast({ title: "PDF split", description: "split.pdf download started." });
    };
    const handleRotate = async () => {
        if (!rotateFile) {
            toast({ title: "Select a PDF", description: "Choose a PDF before rotating pages.", variant: "destructive" });
            return;
        }
        const bytes = await rotateFile.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pagesToRotate = parsePageSelection(rotatePages, doc.getPageCount());
        if (pagesToRotate.length === 0) {
            toast({ title: "Invalid pages", description: "Use pages like 1,3,5-8.", variant: "destructive" });
            return;
        }
        pagesToRotate.forEach((pageIndex) => {
            doc.getPage(pageIndex).setRotation(degrees(rotateDegrees));
        });
        const pdfBytes = await doc.save();
        downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "rotated.pdf");
        addDownloadHistory({
            id: `${Date.now()}-rotated`,
            name: "rotated.pdf",
            type: "pdf",
            time: new Date().toISOString(),
            source: "pdf-tools",
        });
        toast({ title: "Pages rotated", description: `${pagesToRotate.length} page(s) updated.` });
    };
    const handleDelete = async () => {
        if (!deleteFile) {
            toast({ title: "Select a PDF", description: "Choose a PDF before deleting pages.", variant: "destructive" });
            return;
        }
        const bytes = await deleteFile.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pagesToDelete = parsePageSelection(deletePages, doc.getPageCount());
        if (pagesToDelete.length === 0 || pagesToDelete.length >= doc.getPageCount()) {
            toast({ title: "Invalid pages", description: "Select valid pages, but leave at least one page in the PDF.", variant: "destructive" });
            return;
        }
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
        toast({ title: "Pages deleted", description: `${pagesToDelete.length} page(s) removed.` });
    };
    return (<AppShell>
      <div className="grid gap-8">
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-display text-3xl font-semibold">PDF Studio</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Merge, split, rotate, and clean PDFs instantly. Drag-and-drop works across every tool.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary"/>
              <h3 className="text-lg font-semibold">Merge PDFs</h3>
            </div>
            <input type="file" accept="application/pdf" multiple className="mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
            const files = Array.from(event.target.files || []);
            setMergeFiles(files);
            files.forEach((file) => recordRecent(file, "merge"));
        }}/>
            <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={handleMerge}>
              Merge & Download
            </button>
          </section>

          <section className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Scissors className="h-5 w-5 text-primary"/>
              <h3 className="text-lg font-semibold">Split PDF</h3>
            </div>
            <input type="file" accept="application/pdf" className="mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setSplitFile(file);
            recordRecent(file, "split");
        }}/>
            <input type="text" value={splitRange} onChange={(event) => setSplitRange(event.target.value)} className="mt-3 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" placeholder="1-3"/>
            <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={handleSplit}>
              Split & Download
            </button>
          </section>

          <section className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <RotateCw className="h-5 w-5 text-primary"/>
              <h3 className="text-lg font-semibold">Rotate Pages</h3>
            </div>
            <input type="file" accept="application/pdf" className="mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setRotateFile(file);
            recordRecent(file, "rotate");
        }}/>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input type="text" value={rotatePages} onChange={(event) => setRotatePages(event.target.value)} className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" placeholder="Pages e.g. 1,3,5-8"/>
              <input type="number" min={0} step={90} value={rotateDegrees} onChange={(event) => setRotateDegrees(Number(event.target.value))} className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" placeholder="Degrees"/>
            </div>
            <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={handleRotate}>
              Rotate & Download
            </button>
          </section>

          <section className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-primary"/>
              <h3 className="text-lg font-semibold">Delete Pages</h3>
            </div>
            <input type="file" accept="application/pdf" className="mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setDeleteFile(file);
            recordRecent(file, "delete");
        }}/>
            <input type="text" value={deletePages} onChange={(event) => setDeletePages(event.target.value)} className="mt-3 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" placeholder="Pages e.g. 1,3,5-8"/>
            <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={handleDelete}>
              Delete & Download
            </button>
          </section>

          <section className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <ArrowDownToLine className="h-5 w-5 text-primary"/>
              <h3 className="text-lg font-semibold">Compress PDF</h3>
            </div>
            <input type="file" accept="application/pdf" className="mt-4 w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setCompressFile(file);
            recordRecent(file, "compress");
        }}/>
            <div className="mt-4 grid gap-3">
              <label className="text-xs text-muted-foreground">Scale</label>
              <input type="range" min={0.5} max={1} step={0.1} value={compressScale} onChange={(event) => setCompressScale(Number(event.target.value))}/>
              <label className="text-xs text-muted-foreground">Quality</label>
              <input type="range" min={0.4} max={1} step={0.1} value={compressQuality} onChange={(event) => setCompressQuality(Number(event.target.value))}/>
            </div>
            <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={async () => {
            if (!compressFile) {
                toast({ title: "Select a PDF", description: "Choose a PDF before compressing.", variant: "destructive" });
                return;
            }
            try {
                await compressPdf({
                    file: compressFile,
                    scale: compressScale,
                    quality: compressQuality,
                });
                toast({ title: "PDF compressed", description: "compressed.pdf download started." });
            }
            catch {
                toast({ title: "Compression failed", description: "Could not compress this PDF.", variant: "destructive" });
            }
        }}>
              Compress & Download
            </button>
          </section>
        </div>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">Rearrange Pages</h3>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.4fr_0.6fr]">
            <div className="space-y-3">
              <input type="file" accept="application/pdf" className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setReorderFile(file);
            recordRecent(file, "reorder");
        }}/>
              <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={async () => {
            if (!reorderFile || reorderPages.length === 0) {
                toast({ title: "Select a PDF", description: "Upload a PDF before exporting reordered pages.", variant: "destructive" });
                return;
            }
            try {
                await reorderPdf({ file: reorderFile, order: reorderPages });
                toast({ title: "PDF reordered", description: "reordered.pdf download started." });
            }
            catch {
                toast({ title: "Reorder failed", description: "Could not export this PDF.", variant: "destructive" });
            }
        }}>
                Export reordered PDF
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {reorderPages.length === 0 ? (<div className="text-sm text-muted-foreground">Upload a PDF to preview pages.</div>) : (reorderPages.map((pageIndex, position) => (<div key={`${pageIndex}-${position}`} className="rounded-xl border border-border/60 bg-background/60 p-3">
                    <img src={thumbnails[pageIndex]} alt={`Page ${pageIndex + 1}`} className="w-full rounded-lg"/>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Page {pageIndex + 1}</span>
                      <div className="flex gap-1">
                        <button className="rounded border border-border/60 p-1" onClick={() => movePage(position, position - 1, reorderPages, setReorderPages)}>
                          <ArrowUp className="h-3 w-3"/>
                        </button>
                        <button className="rounded border border-border/60 p-1" onClick={() => movePage(position, position + 1, reorderPages, setReorderPages)}>
                          <ArrowDown className="h-3 w-3"/>
                        </button>
                      </div>
                    </div>
                  </div>)))}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">Annotate & Sign</h3>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.6fr_0.4fr]">
            <div className="space-y-4">
              <input type="file" accept="application/pdf" className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setAnnotateFile(file);
            recordRecent(file, "annotate");
        }}/>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min={1} value={annotatePage} onChange={(event) => setAnnotatePage(Number(event.target.value))} className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm" placeholder="Page"/>
                <input type="color" value={highlightColor} onChange={(event) => setHighlightColor(event.target.value)} className="h-10 rounded-lg border border-border/60 bg-background/60 p-1"/>
              </div>
              <input type="text" value={annotateText} onChange={(event) => setAnnotateText(event.target.value)} className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" placeholder="Text annotation"/>
              <input type="text" value={watermarkText} onChange={(event) => setWatermarkText(event.target.value)} className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" placeholder="Watermark"/>
              <input type="file" accept="image/*" className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => setSignatureFile(event.target.files?.[0] || null)}/>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">Draw signature</label>
                <canvas ref={drawCanvasRef} width={360} height={140} className="w-full rounded-lg border border-border/60 bg-background/60" onMouseDown={(event) => startDraw(event, drawCanvasRef, drawColor)} onMouseMove={(event) => draw(event, drawCanvasRef, drawColor)} onMouseUp={() => stopDraw(drawCanvasRef)} onMouseLeave={() => stopDraw(drawCanvasRef)}/>
                <div className="flex items-center gap-3">
                  <input type="color" value={drawColor} onChange={(event) => setDrawColor(event.target.value)} className="h-8 w-10 rounded border border-border/60"/>
                  <button className="rounded-lg border border-border/60 px-3 py-2 text-xs" onClick={() => clearDraw(drawCanvasRef)}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Apply quick annotations to the selected page.</p>
              <div className="grid gap-2">
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={async () => {
            if (!annotateFile) {
                toast({ title: "Select a PDF", description: "Choose a PDF before adding annotations.", variant: "destructive" });
                return;
            }
            try {
                await annotatePdf({
                    file: annotateFile,
                    pageNumber: annotatePage,
                    text: annotateText,
                    watermark: watermarkText,
                    highlightColor,
                    signatureFile,
                    drawCanvas: drawCanvasRef.current,
                });
                toast({ title: "Annotations applied", description: "annotated.pdf download started." });
            }
            catch {
                toast({ title: "Annotation failed", description: "Check the page number and try again.", variant: "destructive" });
            }
        }}>
                  Apply annotations & Download
                </button>
                <p className="text-xs">
                  Watermark, highlight, signature, and text will be added in one export.
                </p>
              </div>
            </div>
          </div>
        </section>

        <PdfViewer file={viewerFile} onFileChange={setViewerFile}/>
      </div>
    </AppShell>);
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
    return (<section className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">PDF Viewer</h3>
          <p className="text-xs text-muted-foreground">Preview and inspect pages.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs" onClick={() => {
            if (!file)
                return;
            downloadBlob(file, file.name);
        }}>
          <ArrowDownToLine className="h-4 w-4"/>
          Download
        </button>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.3fr_0.7fr]">
        <div className="space-y-3">
          <input type="file" accept="application/pdf" className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
            const file = event.target.files?.[0] || null;
            onFileChange(file);
            recordRecent(file, "viewer");
        }}/>
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Page</label>
            <input type="number" min={1} max={pageCount} value={pageNumber} onChange={(event) => setPageNumber(Number(event.target.value))} className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm"/>
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Zoom</label>
            <input type="range" min={0.6} max={2} step={0.1} value={scale} onChange={(event) => setScale(Number(event.target.value))} className="w-full"/>
          </div>
          <p className="text-xs text-muted-foreground">
            {pageCount ? `${pageNumber} / ${pageCount} pages` : "Upload a PDF to preview"}
          </p>
        </div>
        <div className="overflow-auto rounded-xl border border-border/60 bg-background/60 p-4">
          <canvas ref={canvasRef} className="mx-auto"/>
        </div>
      </div>
    </section>);
}
