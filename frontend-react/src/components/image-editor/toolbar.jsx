"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { MousePointer2, Crop, RotateCw, SlidersHorizontal, Sparkles, Maximize2, Undo2, Redo2, Type, Shapes, Sticker, Layers, Grid3x3, } from "lucide-react";
const tools = [
    { id: "select", label: "Select", icon: <MousePointer2 className="h-4 w-4"/> },
    { id: "crop", label: "Crop", icon: <Crop className="h-4 w-4"/> },
    { id: "rotate", label: "Rotate & Flip", icon: <RotateCw className="h-4 w-4"/> },
    { id: "adjust", label: "Adjustments", icon: <SlidersHorizontal className="h-4 w-4"/> },
    { id: "filter", label: "Filters", icon: <Sparkles className="h-4 w-4"/> },
    { id: "resize", label: "Resize", icon: <Maximize2 className="h-4 w-4"/> },
    { id: "text", label: "Text", icon: <Type className="h-4 w-4"/> },
    { id: "shape", label: "Shapes", icon: <Shapes className="h-4 w-4"/> },
    { id: "sticker", label: "Stickers", icon: <Sticker className="h-4 w-4"/> },
    { id: "layers", label: "Layers", icon: <Layers className="h-4 w-4"/> },
    { id: "preset", label: "Presets", icon: <Grid3x3 className="h-4 w-4"/> },
];
export function Toolbar({ activeTool, onToolChange, canUndo, canRedo, onUndo, onRedo, hasImage, }) {
    return (<TooltipProvider>
      <div className="flex flex-col items-center gap-2 border-r border-border bg-card p-2">
        <div className="flex flex-col gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} className="h-9 w-9">
                <Undo2 className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} className="h-9 w-9">
                <Redo2 className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Redo</TooltipContent>
          </Tooltip>
        </div>
        <div className="my-2 h-px w-full bg-border"/>
        <div className="flex flex-col gap-1">
          {tools.map((tool) => (<Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button variant={activeTool === tool.id ? "secondary" : "ghost"} size="icon" onClick={() => onToolChange(tool.id)} disabled={!hasImage} className={`h-9 w-9 ${activeTool === tool.id ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}>
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{tool.label}</TooltipContent>
            </Tooltip>))}
        </div>
      </div>
    </TooltipProvider>);
}
