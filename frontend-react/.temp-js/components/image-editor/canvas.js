"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Stage, Layer, Text, Rect, Circle, Transformer } from "react-konva";
export function Canvas({ image, state, canvasRef, stageRef, layers, activeLayerId, onSelectLayer, onUpdateLayer, isCropping, onCropAreaChange, }) {
    const containerRef = useRef(null);
    const [cropStart, setCropStart] = useState(null);
    const [currentCrop, setCurrentCrop] = useState(null);
    const [scale, setScale] = useState(1);
    const transformerRef = useRef(null);
    const selectedLayer = useMemo(() => layers.find((layer) => layer.id === activeLayerId) || null, [layers, activeLayerId]);
    const getFilterString = useCallback((filterState) => {
        let filter = `brightness(${filterState.brightness}%) contrast(${filterState.contrast}%) saturate(${filterState.saturation}%)`;
        if (filterState.blur > 0) {
            filter += ` blur(${filterState.blur}px)`;
        }
        switch (filterState.filter) {
            case "grayscale":
                filter += " grayscale(100%)";
                break;
            case "sepia":
                filter += " sepia(100%)";
                break;
            case "invert":
                filter += " invert(100%)";
                break;
            case "vintage":
                filter += " sepia(50%) contrast(90%) brightness(90%)";
                break;
            case "cool":
                filter += " hue-rotate(180deg) saturate(80%)";
                break;
            case "warm":
                filter += " sepia(30%) saturate(140%)";
                break;
        }
        return filter;
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !image || !container)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        const rotation = state.rotation;
        const isRotated = rotation === 90 || rotation === 270;
        const displayWidth = isRotated ? state.height : state.width;
        const displayHeight = isRotated ? state.width : state.height;
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        // Calculate scale to fit container
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        const scaleX = containerWidth / displayWidth;
        const scaleY = containerHeight / displayHeight;
        const newScale = Math.min(scaleX, scaleY, 1);
        setScale(newScale);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.filter = getFilterString(state);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        if (state.flipX)
            ctx.scale(-1, 1);
        if (state.flipY)
            ctx.scale(1, -1);
        const drawWidth = isRotated ? state.height : state.width;
        const drawHeight = isRotated ? state.width : state.height;
        ctx.drawImage(image, isRotated ? -state.width / 2 : -drawWidth / 2, isRotated ? -state.height / 2 : -drawHeight / 2, state.width, state.height);
        ctx.restore();
    }, [image, state, canvasRef, getFilterString]);
    useEffect(() => {
        if (!transformerRef.current)
            return;
        const transformer = transformerRef.current;
        if (selectedLayer) {
            const stage = stageRef.current;
            const node = stage?.findOne(`#${selectedLayer.id}`);
            if (node) {
                transformer.nodes([node]);
                transformer.getLayer()?.batchDraw();
            }
        }
        else {
            transformer.nodes([]);
            transformer.getLayer()?.batchDraw();
        }
    }, [selectedLayer, stageRef]);
    const handleMouseDown = useCallback((e) => {
        if (!isCropping)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        setCropStart({ x, y });
        setCurrentCrop({ x, y, width: 0, height: 0 });
    }, [isCropping, scale, canvasRef]);
    const handleMouseMove = useCallback((e) => {
        if (!cropStart || !isCropping)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / scale;
        const currentY = (e.clientY - rect.top) / scale;
        const x = Math.min(cropStart.x, currentX);
        const y = Math.min(cropStart.y, currentY);
        const width = Math.abs(currentX - cropStart.x);
        const height = Math.abs(currentY - cropStart.y);
        setCurrentCrop({ x, y, width, height });
    }, [cropStart, isCropping, scale, canvasRef]);
    const handleMouseUp = useCallback(() => {
        if (currentCrop && currentCrop.width > 10 && currentCrop.height > 10) {
            onCropAreaChange(currentCrop);
        }
        setCropStart(null);
    }, [currentCrop, onCropAreaChange]);
    if (!image) {
        return (_jsx("div", { className: "flex h-full items-center justify-center", children: _jsxs("div", { className: "text-center text-muted-foreground", children: [_jsx("svg", { className: "mx-auto mb-4 h-16 w-16 opacity-50", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("p", { className: "text-lg", children: "No image loaded" }), _jsx("p", { className: "text-sm", children: "Upload an image to start editing" })] }) }));
    }
    return (_jsx("div", { ref: containerRef, className: "relative flex h-full items-center justify-center overflow-hidden p-5", children: _jsxs("div", { className: "relative", style: { transform: `scale(${scale})` }, children: [_jsx("canvas", { ref: canvasRef, className: `max-w-full rounded-sm shadow-2xl ${isCropping ? "cursor-crosshair" : ""}`, onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: handleMouseUp }), _jsx("div", { className: "absolute inset-0", children: _jsx(Stage, { ref: stageRef, width: canvasRef.current?.width || state.width, height: canvasRef.current?.height || state.height, onMouseDown: (event) => {
                            if (event.target === event.target.getStage()) {
                                onSelectLayer(null);
                            }
                        }, children: _jsxs(Layer, { children: [layers.map((layer) => {
                                    if (layer.type === "text" || layer.type === "sticker") {
                                        return (_jsx(Text, { id: layer.id, text: layer.text || "", x: layer.x, y: layer.y, width: layer.width || 320, fontSize: layer.fontSize || 32, fontFamily: layer.fontFamily || "Space Grotesk", fill: layer.fill || "#ffffff", align: layer.align || "left", opacity: layer.opacity ?? 1, draggable: true, onClick: () => onSelectLayer(layer.id), onTap: () => onSelectLayer(layer.id), onDragEnd: (event) => onUpdateLayer(layer.id, {
                                                x: event.target.x(),
                                                y: event.target.y(),
                                            }), onTransformEnd: (event) => {
                                                const node = event.target;
                                                const scaleX = node.scaleX();
                                                const scaleY = node.scaleY();
                                                node.scaleX(1);
                                                node.scaleY(1);
                                                onUpdateLayer(layer.id, {
                                                    x: node.x(),
                                                    y: node.y(),
                                                    rotation: node.rotation(),
                                                    width: Math.max(60, node.width() * scaleX),
                                                    height: Math.max(20, node.height() * scaleY),
                                                });
                                            } }, layer.id));
                                    }
                                    if (layer.type === "rect") {
                                        return (_jsx(Rect, { id: layer.id, x: layer.x, y: layer.y, width: layer.width || 200, height: layer.height || 120, fill: layer.fill || "#22d3ee", opacity: layer.opacity ?? 1, cornerRadius: 14, draggable: true, onClick: () => onSelectLayer(layer.id), onTap: () => onSelectLayer(layer.id), onDragEnd: (event) => onUpdateLayer(layer.id, {
                                                x: event.target.x(),
                                                y: event.target.y(),
                                            }), onTransformEnd: (event) => {
                                                const node = event.target;
                                                const scaleX = node.scaleX();
                                                const scaleY = node.scaleY();
                                                node.scaleX(1);
                                                node.scaleY(1);
                                                onUpdateLayer(layer.id, {
                                                    x: node.x(),
                                                    y: node.y(),
                                                    rotation: node.rotation(),
                                                    width: Math.max(40, node.width() * scaleX),
                                                    height: Math.max(40, node.height() * scaleY),
                                                });
                                            } }, layer.id));
                                    }
                                    return (_jsx(Circle, { id: layer.id, x: layer.x, y: layer.y, radius: layer.radius || 80, fill: layer.fill || "#34d399", opacity: layer.opacity ?? 1, draggable: true, onClick: () => onSelectLayer(layer.id), onTap: () => onSelectLayer(layer.id), onDragEnd: (event) => onUpdateLayer(layer.id, {
                                            x: event.target.x(),
                                            y: event.target.y(),
                                        }), onTransformEnd: (event) => {
                                            const node = event.target;
                                            const scaleX = node.scaleX();
                                            node.scaleX(1);
                                            node.scaleY(1);
                                            onUpdateLayer(layer.id, {
                                                x: node.x(),
                                                y: node.y(),
                                                rotation: node.rotation(),
                                                radius: Math.max(20, (node.radius() || 80) * scaleX),
                                            });
                                        } }, layer.id));
                                }), _jsx(Transformer, { ref: transformerRef, rotateEnabled: true })] }) }) }), isCropping && currentCrop && currentCrop.width > 0 && (_jsx("div", { className: "absolute border-2 border-dashed border-primary bg-primary/20", style: {
                        left: currentCrop.x,
                        top: currentCrop.y,
                        width: currentCrop.width,
                        height: currentCrop.height,
                    } })), state.cropArea && (_jsxs("div", { className: "absolute border-2 border-primary bg-primary/10", style: {
                        left: state.cropArea.x,
                        top: state.cropArea.y,
                        width: state.cropArea.width,
                        height: state.cropArea.height,
                    }, children: [_jsx("div", { className: "absolute -left-1 -top-1 h-3 w-3 rounded-full bg-primary" }), _jsx("div", { className: "absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary" }), _jsx("div", { className: "absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-primary" }), _jsx("div", { className: "absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary" })] }))] }) }));
}
