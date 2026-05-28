"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export function ImageEditor() {
    const editor = useImageEditor();
    const { token } = useAuth();
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
            }
            catch {
                setProjectId(null);
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
    };
    useEffect(() => {
        if (!projectId || !token || !editor.originalImage)
            return;
        setSyncPending(true);
    }, [editor.imageState, editor.layers, projectId, token, editor.originalImage]);
    return (_jsxs("div", { className: "flex h-screen flex-col bg-background", children: [_jsx(Header, { onLoadImage: handleLoadImage, onExport: handleExport, hasImage: !!editor.originalImage, imageInfo: editor.originalImage
                    ? { width: editor.imageState.width, height: editor.imageState.height }
                    : null }), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [_jsx(Toolbar, { activeTool: activeTool, onToolChange: handleToolChange, canUndo: editor.canUndo, canRedo: editor.canRedo, onUndo: editor.undo, onRedo: editor.redo, hasImage: !!editor.originalImage }), _jsx("main", { className: "flex-1 overflow-hidden bg-muted/30", children: editor.originalImage ? (_jsx(Canvas, { image: editor.originalImage, state: editor.imageState, canvasRef: editor.canvasRef, stageRef: editor.stageRef, layers: editor.layers, activeLayerId: editor.activeLayerId, onSelectLayer: editor.setActiveLayerId, onUpdateLayer: editor.updateLayer, isCropping: activeTool === "crop", onCropAreaChange: editor.setCropArea })) : (_jsx(UploadZone, { onUpload: editor.loadImage })) }), _jsx(SidePanel, { activeTool: activeTool, state: editor.imageState, layers: editor.layers, presets: editor.presets, activeLayerId: editor.activeLayerId, onAddLayer: editor.addLayer, onUpdateLayer: editor.updateLayer, onRemoveLayer: editor.removeLayer, onMoveLayer: editor.moveLayer, onSelectLayer: editor.setActiveLayerId, onStateChange: editor.updateState, onRotate: editor.rotate, onFlip: editor.flip, onApplyCrop: editor.applyCrop, onCancelCrop: handleCancelCrop, onResize: editor.resize, onApplyPreset: (preset) => editor.resize(preset.width, preset.height), onApplyChanges: editor.applyChanges, onReset: editor.reset })] })] }));
}
