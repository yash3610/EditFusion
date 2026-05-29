"use client";
import { useEffect, useMemo, useState } from "react";
import { useImageEditor } from "./use-image-editor";
import { Header } from "./header";
import { Toolbar } from "./toolbar";
import { Canvas } from "./canvas";
import { SidePanel } from "./side-panel";
import { UploadZone } from "./upload-zone";
import { useAuth } from "@/components/auth/auth-provider";
import { addDownloadHistory, addRecentFile } from "@/lib/history";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
export function ImageEditor() {
    const editor = useImageEditor();
    const { token } = useAuth();
    const { toast } = useToast();
    const [activeTool, setActiveTool] = useState("select");
    const [projectId, setProjectId] = useState(null);
    const [syncPending, setSyncPending] = useState(false);
    const autosyncKey = useMemo(() => `ef_autosync_${projectId}`, [projectId]);
    const handleToolChange = (tool) => {
        setActiveTool(tool);
        if (tool !== "crop") {
            editor.setCropArea(null);
        }
    };
    const handleCancelCrop = () => {
        editor.setCropArea(null);
        setActiveTool("select");
    };
    useEffect(() => {
        if (!syncPending || !projectId || !token)
            return;
        const timeout = window.setTimeout(async () => {
            try {
                await apiFetch(`/api/projects/${projectId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        status: "draft",
                        metadata: {
                            width: editor.imageState.width,
                            height: editor.imageState.height,
                            layers: editor.layers.length,
                        },
                    }),
                });
                localStorage.setItem(autosyncKey, new Date().toISOString());
            }
            finally {
                setSyncPending(false);
            }
        }, 1200);
        return () => window.clearTimeout(timeout);
    }, [syncPending, projectId, token, editor.imageState, editor.layers, autosyncKey]);
    const handleLoadImage = async (file) => {
        editor.loadImage(file);
        toast({ title: "Image loaded", description: `${file.name} is ready to edit.` });
        addRecentFile({
            id: `${file.name}-${file.size}`,
            name: file.name,
            type: "image",
            time: new Date().toISOString(),
            source: "image-editor",
        });
        if (token) {
            try {
                const project = await apiFetch("/api/projects", {
                    method: "POST",
                    body: JSON.stringify({
                        name: file.name,
                        type: "image",
                        metadata: { size: file.size },
                    }),
                });
                setProjectId(project._id);
                toast({ title: "Project created", description: "Draft sync is active." });
            }
            catch {
                setProjectId(null);
                toast({
                    title: "Project sync skipped",
                    description: "Image is loaded locally, but project draft was not created.",
                    variant: "destructive",
                });
            }
        }
    };
    const handleExport = (format, quality) => {
        editor.exportImage(format, quality);
        addDownloadHistory({
            id: `${Date.now()}-${format}`,
            name: `edited-image.${format}`,
            type: format,
            time: new Date().toISOString(),
            source: "image-editor",
        });
        toast({ title: "Export started", description: `Downloading edited-image.${format}.` });
    };
    const handleAddLayer = (layer) => {
        editor.addLayer(layer);
        toast({
            title: layer.type === "text" ? "Text added" : "Layer added",
            description: layer.type === "text" ? "You can edit it from the text panel." : `${layer.type} layer added.`,
        });
    };
    const handleRemoveLayer = (id) => {
        const layer = editor.layers.find((item) => item.id === id);
        editor.removeLayer(id);
        toast({
            title: layer?.type === "text" ? "Text deleted" : "Layer deleted",
            description: "The selected layer was removed.",
        });
    };
    const handleDuplicateLayer = (id) => {
        const layer = editor.layers.find((item) => item.id === id);
        editor.duplicateLayer(id);
        toast({
            title: "Layer duplicated",
            description: layer?.type ? `${layer.type} layer copied.` : "Selected layer copied.",
        });
    };
    useEffect(() => {
        if (!projectId || !token || !editor.originalImage)
            return;
        setSyncPending(true);
    }, [editor.imageState, editor.layers, projectId, token, editor.originalImage]);
    return (<div className="flex h-[calc(100vh-8rem)] min-h-160 flex-col overflow-hidden rounded-xl border border-border bg-background">
      <Header onLoadImage={handleLoadImage} onExport={handleExport} hasImage={!!editor.originalImage} imageInfo={editor.originalImage
            ? { width: editor.imageState.width, height: editor.imageState.height }
            : null}/>
      <div className="flex flex-1 overflow-hidden">
        <Toolbar activeTool={activeTool} onToolChange={handleToolChange} canUndo={editor.canUndo} canRedo={editor.canRedo} onUndo={editor.undo} onRedo={editor.redo} hasImage={!!editor.originalImage}/>
        <main className="flex-1 overflow-hidden bg-muted/30">
          {editor.originalImage ? (<Canvas image={editor.originalImage} state={editor.imageState} canvasRef={editor.canvasRef} stageRef={editor.stageRef} layers={editor.layers} activeLayerId={editor.activeLayerId} onSelectLayer={editor.setActiveLayerId} onUpdateLayer={editor.updateLayer} isCropping={activeTool === "crop"} onCropAreaChange={editor.setCropArea}/>) : (<UploadZone onUpload={handleLoadImage}/>)}
        </main>
        <SidePanel activeTool={activeTool} state={editor.imageState} layers={editor.layers} presets={editor.presets} activeLayerId={editor.activeLayerId} onAddLayer={handleAddLayer} onUpdateLayer={editor.updateLayer} onRemoveLayer={handleRemoveLayer} onDuplicateLayer={handleDuplicateLayer} onMoveLayer={editor.moveLayer} onSelectLayer={editor.setActiveLayerId} onStateChange={editor.updateState} onRotate={editor.rotate} onFlip={editor.flip} onApplyCrop={editor.applyCrop} onCancelCrop={handleCancelCrop} onResize={editor.resize} onApplyPreset={(preset) => editor.resize(preset.width, preset.height)} onApplyChanges={editor.applyChanges} onReset={editor.reset}/>
      </div>
    </div>);
}
