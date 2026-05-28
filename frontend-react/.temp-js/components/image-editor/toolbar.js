"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { MousePointer2, Crop, RotateCw, SlidersHorizontal, Sparkles, Maximize2, Undo2, Redo2, Type, Shapes, Sticker, Layers, Grid3x3, } from "lucide-react";
const tools = [
    { id: "select", label: "Select", icon: _jsx(MousePointer2, { className: "h-4 w-4" }) },
    { id: "crop", label: "Crop", icon: _jsx(Crop, { className: "h-4 w-4" }) },
    { id: "rotate", label: "Rotate & Flip", icon: _jsx(RotateCw, { className: "h-4 w-4" }) },
    { id: "adjust", label: "Adjustments", icon: _jsx(SlidersHorizontal, { className: "h-4 w-4" }) },
    { id: "filter", label: "Filters", icon: _jsx(Sparkles, { className: "h-4 w-4" }) },
    { id: "resize", label: "Resize", icon: _jsx(Maximize2, { className: "h-4 w-4" }) },
    { id: "text", label: "Text", icon: _jsx(Type, { className: "h-4 w-4" }) },
    { id: "shape", label: "Shapes", icon: _jsx(Shapes, { className: "h-4 w-4" }) },
    { id: "sticker", label: "Stickers", icon: _jsx(Sticker, { className: "h-4 w-4" }) },
    { id: "layers", label: "Layers", icon: _jsx(Layers, { className: "h-4 w-4" }) },
    { id: "preset", label: "Presets", icon: _jsx(Grid3x3, { className: "h-4 w-4" }) },
];
export function Toolbar({ activeTool, onToolChange, canUndo, canRedo, onUndo, onRedo, hasImage, }) {
    return (_jsx(TooltipProvider, { children: _jsxs("div", { className: "flex flex-col items-center gap-2 border-r border-border bg-card p-2", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", onClick: onUndo, disabled: !canUndo, className: "h-9 w-9", children: _jsx(Undo2, { className: "h-4 w-4" }) }) }), _jsx(TooltipContent, { side: "right", children: "Undo" })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", onClick: onRedo, disabled: !canRedo, className: "h-9 w-9", children: _jsx(Redo2, { className: "h-4 w-4" }) }) }), _jsx(TooltipContent, { side: "right", children: "Redo" })] })] }), _jsx("div", { className: "my-2 h-px w-full bg-border" }), _jsx("div", { className: "flex flex-col gap-1", children: tools.map((tool) => (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: activeTool === tool.id ? "secondary" : "ghost", size: "icon", onClick: () => onToolChange(tool.id), disabled: !hasImage, className: `h-9 w-9 ${activeTool === tool.id ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`, children: tool.icon }) }), _jsx(TooltipContent, { side: "right", children: tool.label })] }, tool.id))) })] }) }));
}
