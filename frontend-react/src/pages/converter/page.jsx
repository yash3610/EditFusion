"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { API_URL } from "@/lib/api";
import { ArrowDownToLine, Repeat } from "lucide-react";
import { addDownloadHistory, addRecentFile } from "@/lib/history";
import { useToast } from "@/hooks/use-toast";
const downloadDataUrl = (dataUrl, filename) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
};
export default function ConverterPage() {
    const { toast } = useToast();
    const [file, setFile] = useState(null);
    const [format, setFormat] = useState("png");
    const [docFile, setDocFile] = useState(null);
    const [docType, setDocType] = useState("docx");
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfTarget, setPdfTarget] = useState("docx");
    const [batchFiles, setBatchFiles] = useState([]);
    const [batchTarget, setBatchTarget] = useState("pdf");
    const handleConvert = async () => {
        if (!file) {
            toast({ title: "Select an image", description: "Choose an image before converting.", variant: "destructive" });
            return;
        }
        const output = await convertImage(file, format);
        if (!output) {
            toast({ title: "Conversion failed", description: "Could not read this image.", variant: "destructive" });
            return;
        }
        downloadDataUrl(output, `converted.${format}`);
        addDownloadHistory({
            id: `${Date.now()}-${format}`,
            name: `converted.${format}`,
            type: format,
            time: new Date().toISOString(),
            source: "converter",
        });
        toast({ title: "Image converted", description: `converted.${format} download started.` });
    };
    const handleDocConvert = async () => {
        if (!docFile) {
            toast({ title: "Select a document", description: "Choose a DOCX, PPTX, or XLSX file.", variant: "destructive" });
            return;
        }
        try {
            const formData = new FormData();
            formData.append("file", docFile);
            const token = localStorage.getItem("ef_token");
            const response = await fetch(`${API_URL}/api/convert/${docType}`, {
                method: "POST",
                body: formData,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!response.ok)
                throw new Error("Request failed");
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
            toast({ title: "Document converted", description: `${link.download} download started.` });
        }
        catch {
            toast({ title: "Conversion failed", description: "Server conversion is not available right now.", variant: "destructive" });
        }
    };
    const handlePdfConvert = async () => {
        if (!pdfFile) {
            toast({ title: "Select a PDF", description: "Choose a PDF before converting.", variant: "destructive" });
            return;
        }
        try {
            const formData = new FormData();
            formData.append("file", pdfFile);
            const token = localStorage.getItem("ef_token");
            const response = await fetch(`${API_URL}/api/convert/pdf-to/${pdfTarget}`, {
                method: "POST",
                body: formData,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!response.ok)
                throw new Error("Request failed");
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
            toast({ title: "PDF converted", description: `${link.download} download started.` });
        }
        catch {
            toast({ title: "Conversion failed", description: "Server conversion is not available right now.", variant: "destructive" });
        }
    };
    const handleBatchConvert = async () => {
        if (batchFiles.length === 0) {
            toast({ title: "Select files", description: "Choose files before batch conversion.", variant: "destructive" });
            return;
        }
        try {
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
                throw new Error("Request failed");
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
            toast({ title: "Batch converted", description: "converted.zip download started." });
        }
        catch {
            toast({ title: "Batch failed", description: "Server conversion is not available right now.", variant: "destructive" });
        }
    };
    return (<AppShell>
      <div className="grid gap-8">
        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-display text-3xl font-semibold">File Converter</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Convert image formats instantly with high-quality output.
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Repeat className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">Image Converter</h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]">
            <input type="file" accept="image/*,image/svg+xml" className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
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
        }}/>
            <select value={format} onChange={(event) => setFormat(event.target.value)} className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
              <option value="webp">WebP</option>
            </select>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={handleConvert}>
              <ArrowDownToLine className="h-4 w-4"/>
              Convert
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Supports JPG, PNG, WebP, and SVG inputs. SVG exports render to PNG/WebP/JPG.
          </p>
        </section>
        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Repeat className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">Document to PDF</h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]">
            <input type="file" accept=".docx,.pptx,.xlsx" className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
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
        }}/>
            <select value={docType} onChange={(event) => setDocType(event.target.value)} className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
              <option value="docx">Word to PDF</option>
              <option value="pptx">PPT to PDF</option>
              <option value="xlsx">Excel to PDF</option>
            </select>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={handleDocConvert}>
              <ArrowDownToLine className="h-4 w-4"/>
              Convert
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Requires LibreOffice on the server for reliable conversion.
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Repeat className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">PDF to Office</h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]">
            <input type="file" accept="application/pdf" className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => {
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
        }}/>
            <select value={pdfTarget} onChange={(event) => setPdfTarget(event.target.value)} className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
              <option value="docx">PDF to Word</option>
              <option value="pptx">PDF to PPT</option>
              <option value="xlsx">PDF to Excel</option>
            </select>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={handlePdfConvert}>
              <ArrowDownToLine className="h-4 w-4"/>
              Convert
            </button>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Repeat className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">Batch Converter</h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]">
            <input type="file" multiple accept=".docx,.pptx,.xlsx,application/pdf" className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => setBatchFiles(Array.from(event.target.files || []))}/>
            <select value={batchTarget} onChange={(event) => setBatchTarget(event.target.value)} className="rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
              <option value="pdf">Office → PDF</option>
              <option value="docx">PDF → Word</option>
              <option value="pptx">PDF → PPT</option>
              <option value="xlsx">PDF → Excel</option>
            </select>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={handleBatchConvert}>
              <ArrowDownToLine className="h-4 w-4"/>
              Convert Batch
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Batch conversion returns a ZIP file with all converted documents.
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Repeat className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">Coming soon</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
            "Video converter",
            "Audio converter",
            "GIF maker",
        ].map((item) => (<div key={item} className="rounded-xl border border-border/60 bg-background/60 p-4">
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-2 text-xs text-muted-foreground">Scaffolded for future rollouts.</p>
              </div>))}
          </div>
        </section>
      </div>
    </AppShell>);
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
