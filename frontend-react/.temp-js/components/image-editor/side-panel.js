"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Check, X, Link2, Link2Off, Trash2, ArrowUp, ArrowDown, AlignLeft, AlignCenter, AlignRight, Type, Shapes, Sticker, } from "lucide-react";
const filters = [
    { id: "none", label: "None", preview: "bg-gradient-to-br from-slate-400 to-slate-600" },
    { id: "grayscale", label: "Grayscale", preview: "bg-gradient-to-br from-gray-400 to-gray-600 grayscale" },
    { id: "sepia", label: "Sepia", preview: "bg-gradient-to-br from-amber-400 to-amber-600 sepia" },
    { id: "invert", label: "Invert", preview: "bg-gradient-to-br from-slate-400 to-slate-600 invert" },
    { id: "vintage", label: "Vintage", preview: "bg-gradient-to-br from-yellow-400 to-orange-600 sepia-[.5]" },
    { id: "cool", label: "Cool", preview: "bg-gradient-to-br from-blue-400 to-cyan-600 hue-rotate-180" },
    { id: "warm", label: "Warm", preview: "bg-gradient-to-br from-orange-400 to-red-600 sepia-[.3]" },
];
const fontOptions = [
    "Space Grotesk",
    "Fraunces",
    "Inter",
    "Poppins",
    "Montserrat",
    "Roboto",
    "Playfair Display",
];
export function SidePanel({ activeTool, state, layers, presets, activeLayerId, onAddLayer, onUpdateLayer, onRemoveLayer, onMoveLayer, onSelectLayer, onStateChange, onRotate, onFlip, onApplyCrop, onCancelCrop, onResize, onApplyPreset, onApplyChanges, onReset, }) {
    const [resizeWidth, setResizeWidth] = useState(state.width);
    const [resizeHeight, setResizeHeight] = useState(state.height);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [textValue, setTextValue] = useState("EditFusion");
    const [textSize, setTextSize] = useState(42);
    const [textColor, setTextColor] = useState("#ffffff");
    const [shapeColor, setShapeColor] = useState("#22d3ee");
    const aspectRatio = state.width / state.height;
    const activeLayer = layers.find((layer) => layer.id === activeLayerId) || null;
    useEffect(() => {
        setResizeWidth(state.width);
        setResizeHeight(state.height);
    }, [state.width, state.height]);
    const handleWidthChange = (value) => {
        const width = parseInt(value) || 0;
        setResizeWidth(width);
        if (maintainAspectRatio && width > 0) {
            setResizeHeight(Math.round(width / aspectRatio));
        }
    };
    const handleHeightChange = (value) => {
        const height = parseInt(value) || 0;
        setResizeHeight(height);
        if (maintainAspectRatio && height > 0) {
            setResizeWidth(Math.round(height * aspectRatio));
        }
    };
    const renderContent = () => {
        switch (activeTool) {
            case "crop":
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Crop Image" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Click and drag on the image to select the area you want to keep." }), state.cropArea && (_jsxs("div", { className: "space-y-2 rounded-lg bg-secondary/50 p-3", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Selected Area" }), _jsxs("p", { className: "text-sm", children: [Math.round(state.cropArea.width), " \u00D7 ", Math.round(state.cropArea.height), " px"] })] })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: onApplyCrop, disabled: !state.cropArea, className: "flex-1", children: [_jsx(Check, { className: "mr-2 h-4 w-4" }), "Apply"] }), _jsxs(Button, { variant: "outline", onClick: onCancelCrop, className: "flex-1", children: [_jsx(X, { className: "mr-2 h-4 w-4" }), "Cancel"] })] })] }));
            case "rotate":
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Rotate & Flip" }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Rotate" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => onRotate(-90), children: [_jsx(RotateCcw, { className: "mr-2 h-4 w-4" }), "Left 90\u00B0"] }), _jsxs(Button, { variant: "outline", onClick: () => onRotate(90), children: [_jsx(RotateCw, { className: "mr-2 h-4 w-4" }), "Right 90\u00B0"] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Flip" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs(Button, { variant: state.flipX ? "secondary" : "outline", onClick: () => onFlip("horizontal"), children: [_jsx(FlipHorizontal, { className: "mr-2 h-4 w-4" }), "Horizontal"] }), _jsxs(Button, { variant: state.flipY ? "secondary" : "outline", onClick: () => onFlip("vertical"), children: [_jsx(FlipVertical, { className: "mr-2 h-4 w-4" }), "Vertical"] })] })] }), _jsxs("div", { className: "rounded-lg bg-secondary/50 p-3", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Current Rotation" }), _jsxs("p", { className: "text-sm font-medium", children: [state.rotation, "\u00B0"] })] })] }));
            case "adjust":
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Adjustments" }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-sm", children: "Brightness" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [state.brightness, "%"] })] }), _jsx(Slider, { value: [state.brightness], onValueChange: ([value]) => onStateChange({ brightness: value }), min: 0, max: 200, step: 1 })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-sm", children: "Contrast" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [state.contrast, "%"] })] }), _jsx(Slider, { value: [state.contrast], onValueChange: ([value]) => onStateChange({ contrast: value }), min: 0, max: 200, step: 1 })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-sm", children: "Saturation" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [state.saturation, "%"] })] }), _jsx(Slider, { value: [state.saturation], onValueChange: ([value]) => onStateChange({ saturation: value }), min: 0, max: 200, step: 1 })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-sm", children: "Blur" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [state.blur, "px"] })] }), _jsx(Slider, { value: [state.blur], onValueChange: ([value]) => onStateChange({ blur: value }), min: 0, max: 20, step: 0.5 })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: onApplyChanges, className: "flex-1", children: "Apply Changes" }), _jsx(Button, { variant: "outline", onClick: onReset, className: "flex-1", children: "Reset" })] })] }));
            case "filter":
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Filters" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: filters.map((filter) => (_jsxs("button", { onClick: () => onStateChange({ filter: filter.id }), className: `group relative overflow-hidden rounded-lg border-2 transition-all ${state.filter === filter.id
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-border hover:border-muted-foreground/50"}`, children: [_jsx("div", { className: `aspect-square w-full ${filter.preview}` }), _jsx("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2", children: _jsx("span", { className: "text-xs font-medium text-white", children: filter.label }) })] }, filter.id))) }), _jsx(Button, { onClick: onApplyChanges, className: "w-full", children: "Apply Filter" })] }));
            case "resize":
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Resize Image" }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setMaintainAspectRatio(!maintainAspectRatio), className: "gap-2", children: [maintainAspectRatio ? (_jsx(Link2, { className: "h-4 w-4" })) : (_jsx(Link2Off, { className: "h-4 w-4" })), maintainAspectRatio ? "Linked" : "Unlinked"] }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Width (px)" }), _jsx(Input, { type: "number", value: resizeWidth, onChange: (e) => handleWidthChange(e.target.value), min: 1 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Height (px)" }), _jsx(Input, { type: "number", value: resizeHeight, onChange: (e) => handleHeightChange(e.target.value), min: 1 })] })] }), _jsxs("div", { className: "rounded-lg bg-secondary/50 p-3", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Original Size" }), _jsxs("p", { className: "text-sm font-medium", children: [state.width, " \u00D7 ", state.height, " px"] })] }), _jsx(Button, { onClick: () => onResize(resizeWidth, resizeHeight), className: "w-full", children: "Apply Resize" })] }));
            case "text":
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Type, { className: "h-4 w-4 text-primary" }), _jsx("h3", { className: "font-semibold text-foreground", children: "Add Text" })] }), _jsx(Input, { value: textValue, onChange: (e) => setTextValue(e.target.value), placeholder: "Type something" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Size" }), _jsx(Input, { type: "number", min: 12, value: textSize, onChange: (e) => setTextSize(Number(e.target.value)) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Color" }), _jsx(Input, { type: "color", value: textColor, onChange: (e) => setTextColor(e.target.value) })] })] }), _jsx(Button, { onClick: () => onAddLayer({
                                id: crypto.randomUUID(),
                                type: "text",
                                x: 80,
                                y: 80,
                                text: textValue,
                                fontSize: textSize,
                                fontFamily: "Space Grotesk",
                                fill: textColor,
                                opacity: 1,
                                align: "left",
                            }), children: "Add Text Layer" })] }));
            case "shape":
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shapes, { className: "h-4 w-4 text-primary" }), _jsx("h3", { className: "font-semibold text-foreground", children: "Shapes" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Color" }), _jsx(Input, { type: "color", value: shapeColor, onChange: (e) => setShapeColor(e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => onAddLayer({
                                        id: crypto.randomUUID(),
                                        type: "rect",
                                        x: 120,
                                        y: 120,
                                        width: 220,
                                        height: 140,
                                        fill: shapeColor,
                                        opacity: 1,
                                    }), children: "Rectangle" }), _jsx(Button, { variant: "outline", onClick: () => onAddLayer({
                                        id: crypto.randomUUID(),
                                        type: "circle",
                                        x: 200,
                                        y: 200,
                                        radius: 90,
                                        fill: shapeColor,
                                        opacity: 1,
                                    }), children: "Circle" })] })] }));
            case "sticker":
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sticker, { className: "h-4 w-4 text-primary" }), _jsx("h3", { className: "font-semibold text-foreground", children: "Stickers" })] }), _jsx("div", { className: "grid grid-cols-4 gap-2 text-2xl", children: ["✨", "🔥", "💎", "🚀", "🎯", "✅", "🌈", "⚡"].map((emoji) => (_jsx("button", { className: "rounded-lg border border-border/60 bg-background/60 p-2", onClick: () => onAddLayer({
                                    id: crypto.randomUUID(),
                                    type: "sticker",
                                    x: 140,
                                    y: 140,
                                    text: emoji,
                                    fontSize: 48,
                                    opacity: 1,
                                    align: "center",
                                }), children: emoji }, emoji))) })] }));
            case "layers":
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Layers" }), _jsx("div", { className: "space-y-2", children: layers.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No layers yet." })) : (layers
                                .slice()
                                .reverse()
                                .map((layer) => (_jsxs("div", { className: `flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${activeLayerId === layer.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border/60"}`, children: [_jsxs("button", { onClick: () => onSelectLayer(layer.id), className: "flex-1 text-left", children: [layer.type.toUpperCase(), " \u00B7 ", layer.id.slice(0, 4)] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => onMoveLayer(layer.id, "up"), className: "rounded border border-border/60 p-1", children: _jsx(ArrowUp, { className: "h-3 w-3" }) }), _jsx("button", { onClick: () => onMoveLayer(layer.id, "down"), className: "rounded border border-border/60 p-1", children: _jsx(ArrowDown, { className: "h-3 w-3" }) }), _jsx("button", { onClick: () => onRemoveLayer(layer.id), className: "rounded border border-border/60 p-1 text-destructive", children: _jsx(Trash2, { className: "h-3 w-3" }) })] })] }, layer.id)))) }), activeLayer && (_jsxs("div", { className: "space-y-4 rounded-lg border border-border/60 bg-background/60 p-3", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: "Layer Properties" }), _jsx("span", { children: activeLayer.type.toUpperCase() })] }), (activeLayer.type === "text" || activeLayer.type === "sticker") && (_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { value: activeLayer.text || "", onChange: (event) => onUpdateLayer(activeLayer.id, { text: event.target.value }), placeholder: "Layer text" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Font" }), _jsx("select", { value: activeLayer.fontFamily || "Space Grotesk", onChange: (event) => onUpdateLayer(activeLayer.id, {
                                                                fontFamily: event.target.value,
                                                            }), className: "w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm", children: fontOptions.map((font) => (_jsx("option", { value: font, children: font }, font))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Size" }), _jsx(Input, { type: "number", min: 12, value: activeLayer.fontSize || 32, onChange: (event) => onUpdateLayer(activeLayer.id, {
                                                                fontSize: Number(event.target.value),
                                                            }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Color" }), _jsx(Input, { type: "color", value: activeLayer.fill || "#ffffff", onChange: (event) => onUpdateLayer(activeLayer.id, { fill: event.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Alignment" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: activeLayer.align === "left" ? "secondary" : "outline", size: "icon", onClick: () => onUpdateLayer(activeLayer.id, { align: "left" }), children: _jsx(AlignLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: activeLayer.align === "center" ? "secondary" : "outline", size: "icon", onClick: () => onUpdateLayer(activeLayer.id, { align: "center" }), children: _jsx(AlignCenter, { className: "h-4 w-4" }) }), _jsx(Button, { variant: activeLayer.align === "right" ? "secondary" : "outline", size: "icon", onClick: () => onUpdateLayer(activeLayer.id, { align: "right" }), children: _jsx(AlignRight, { className: "h-4 w-4" }) })] })] })] })] })), (activeLayer.type === "rect" || activeLayer.type === "circle") && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Fill" }), _jsx(Input, { type: "color", value: activeLayer.fill || "#22d3ee", onChange: (event) => onUpdateLayer(activeLayer.id, { fill: event.target.value }) })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Opacity" }), _jsx(Slider, { value: [Math.round((activeLayer.opacity ?? 1) * 100)], onValueChange: ([value]) => onUpdateLayer(activeLayer.id, { opacity: value / 100 }), min: 10, max: 100, step: 1 })] })] }))] }));
            case "preset":
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Social Presets" }), _jsx("div", { className: "space-y-2", children: presets.map((preset) => (_jsxs("button", { onClick: () => onApplyPreset(preset), className: "flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm", children: [_jsx("span", { children: preset.label }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [preset.width, " x ", preset.height] })] }, preset.id))) })] }));
            default:
                return (_jsx("div", { className: "flex h-full flex-col items-center justify-center text-center", children: _jsx("div", { className: "space-y-2", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "Select a tool from the toolbar to start editing" }) }) }));
        }
    };
    return (_jsxs("div", { className: "flex h-full w-64 flex-col border-l border-border bg-card", children: [_jsx("div", { className: "border-b border-border p-3", children: _jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Tools" }) }), _jsx(ScrollArea, { className: "flex-1", children: _jsx("div", { className: "p-4", children: renderContent() }) })] }));
}
