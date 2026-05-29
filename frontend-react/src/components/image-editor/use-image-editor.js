"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
const defaultState = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    rotation: 0,
    flipX: false,
    flipY: false,
    filter: "none",
    cropArea: null,
    width: 0,
    height: 0,
};
export function useImageEditor() {
    const [originalImage, setOriginalImage] = useState(null);
    const [imageState, setImageState] = useState(defaultState);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const [layers, setLayers] = useState([]);
    const [activeLayerId, setActiveLayerId] = useState(null);
    const autosaveTimeout = useRef(null);
    const addToHistory = useCallback((state, imageData) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ state, imageData });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);
    const loadImage = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                setOriginalImage(img);
                setLayers([]);
                setActiveLayerId(null);
                const newState = {
                    ...defaultState,
                    width: img.width,
                    height: img.height,
                };
                setImageState(newState);
                addToHistory(newState, e.target?.result);
            };
            img.src = e.target?.result;
        };
        reader.readAsDataURL(file);
    }, [addToHistory]);
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const raw = localStorage.getItem("ef_autosave");
        if (!raw)
            return;
        try {
            const data = JSON.parse(raw);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                setOriginalImage(img);
                setImageState(data.imageState);
                setLayers(data.layers || []);
            };
            img.src = data.imageData;
        }
        catch {
            localStorage.removeItem("ef_autosave");
        }
    }, []);
    useEffect(() => {
        if (!originalImage)
            return;
        if (autosaveTimeout.current) {
            window.clearTimeout(autosaveTimeout.current);
        }
        autosaveTimeout.current = window.setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const imageData = canvas.toDataURL("image/png");
            const payload = {
                imageData,
                imageState,
                layers,
            };
            localStorage.setItem("ef_autosave", JSON.stringify(payload));
        }, 1200);
    }, [imageState, layers, originalImage]);
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setImageState(history[newIndex].state);
        }
    }, [historyIndex, history]);
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setImageState(history[newIndex].state);
        }
    }, [historyIndex, history]);
    const updateState = useCallback((updates) => {
        const newState = { ...imageState, ...updates };
        setImageState(newState);
    }, [imageState]);
    const applyChanges = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const imageData = canvas.toDataURL("image/png");
            addToHistory(imageState, imageData);
        }
    }, [imageState, addToHistory]);
    const addLayer = useCallback((layer) => {
        setLayers((prev) => [...prev, layer]);
        setActiveLayerId(layer.id);
    }, []);
    const updateLayer = useCallback((id, updates) => {
        setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)));
    }, []);
    const removeLayer = useCallback((id) => {
        setLayers((prev) => prev.filter((layer) => layer.id !== id));
        setActiveLayerId((prev) => (prev === id ? null : prev));
    }, []);
    const duplicateLayer = useCallback((id) => {
        setLayers((prev) => {
            const layer = prev.find((item) => item.id === id);
            if (!layer)
                return prev;
            const duplicate = {
                ...layer,
                id: crypto.randomUUID(),
                x: (layer.x || 0) + 24,
                y: (layer.y || 0) + 24,
            };
            setActiveLayerId(duplicate.id);
            return [...prev, duplicate];
        });
    }, []);
    const moveLayer = useCallback((id, direction) => {
        setLayers((prev) => {
            const index = prev.findIndex((layer) => layer.id === id);
            if (index === -1)
                return prev;
            const newIndex = direction === "up" ? index + 1 : index - 1;
            if (newIndex < 0 || newIndex >= prev.length)
                return prev;
            const updated = [...prev];
            const [item] = updated.splice(index, 1);
            updated.splice(newIndex, 0, item);
            return updated;
        });
    }, []);
    const presets = useMemo(() => [
        { id: "ig-post", label: "Instagram Post", width: 1080, height: 1080 },
        { id: "yt-thumb", label: "YouTube Thumbnail", width: 1280, height: 720 },
        { id: "wa-status", label: "WhatsApp Status", width: 1080, height: 1920 },
        { id: "fb-cover", label: "Facebook Cover", width: 820, height: 312 },
        { id: "li-banner", label: "LinkedIn Banner", width: 1584, height: 396 },
    ], []);
    const rotate = useCallback((degrees) => {
        const newRotation = (imageState.rotation + degrees) % 360;
        updateState({ rotation: newRotation });
    }, [imageState.rotation, updateState]);
    const flip = useCallback((direction) => {
        if (direction === "horizontal") {
            updateState({ flipX: !imageState.flipX });
        }
        else {
            updateState({ flipY: !imageState.flipY });
        }
    }, [imageState.flipX, imageState.flipY, updateState]);
    const setFilter = useCallback((filter) => {
        updateState({ filter });
    }, [updateState]);
    const setCropArea = useCallback((cropArea) => {
        updateState({ cropArea });
    }, [updateState]);
    const applyCrop = useCallback(() => {
        if (!imageState.cropArea || !originalImage || !canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        const x = Math.max(0, Math.round(imageState.cropArea.x));
        const y = Math.max(0, Math.round(imageState.cropArea.y));
        const width = Math.max(1, Math.round(imageState.cropArea.width));
        const height = Math.max(1, Math.round(imageState.cropArea.height));
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx)
            return;
        tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
        const croppedImg = new Image();
        croppedImg.crossOrigin = "anonymous";
        croppedImg.onload = () => {
            setOriginalImage(croppedImg);
            const newState = {
                ...imageState,
                cropArea: null,
                width,
                height,
            };
            setImageState(newState);
            addToHistory(newState, tempCanvas.toDataURL("image/png"));
        };
        croppedImg.src = tempCanvas.toDataURL("image/png");
    }, [imageState, originalImage, addToHistory]);
    const resize = useCallback((newWidth, newHeight) => {
        updateState({ width: newWidth, height: newHeight });
    }, [updateState]);
    const reset = useCallback(() => {
        if (originalImage) {
            setImageState({
                ...defaultState,
                width: originalImage.width,
                height: originalImage.height,
            });
        }
    }, [originalImage]);
    const exportImage = useCallback((format, quality = 0.92) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const stage = stageRef.current;
        const outputCanvas = document.createElement("canvas");
        outputCanvas.width = canvas.width;
        outputCanvas.height = canvas.height;
        const ctx = outputCanvas.getContext("2d");
        if (!ctx)
            return;
        ctx.drawImage(canvas, 0, 0);
        if (stage) {
            const overlayUrl = stage.toDataURL({ pixelRatio: 2 });
            const overlayImg = new Image();
            overlayImg.onload = () => {
                ctx.drawImage(overlayImg, 0, 0, outputCanvas.width, outputCanvas.height);
                const mimeType = `image/${format}`;
                const dataUrl = outputCanvas.toDataURL(mimeType, quality);
                const link = document.createElement("a");
                link.download = `edited-image.${format}`;
                link.href = dataUrl;
                link.click();
            };
            overlayImg.src = overlayUrl;
            return;
        }
        const mimeType = `image/${format}`;
        const dataUrl = outputCanvas.toDataURL(mimeType, quality);
        const link = document.createElement("a");
        link.download = `edited-image.${format}`;
        link.href = dataUrl;
        link.click();
    }, []);
    return {
        originalImage,
        imageState,
        canvasRef,
        stageRef,
        history,
        historyIndex,
        layers,
        activeLayerId,
        presets,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        loadImage,
        undo,
        redo,
        updateState,
        applyChanges,
        rotate,
        flip,
        setFilter,
        setCropArea,
        applyCrop,
        resize,
        reset,
        exportImage,
        addLayer,
        updateLayer,
        removeLayer,
        duplicateLayer,
        moveLayer,
        setActiveLayerId,
    };
}
