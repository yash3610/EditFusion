"use client";
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
                return (<div className="space-y-4">
            <h3 className="font-semibold text-foreground">Crop Image</h3>
            <p className="text-sm text-muted-foreground">
              Click and drag on the image to select the area you want to keep.
            </p>
            {state.cropArea && (<div className="space-y-2 rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Selected Area</p>
                <p className="text-sm">
                  {Math.round(state.cropArea.width)} × {Math.round(state.cropArea.height)} px
                </p>
              </div>)}
            <div className="flex gap-2">
              <Button onClick={onApplyCrop} disabled={!state.cropArea} className="flex-1">
                <Check className="mr-2 h-4 w-4"/>
                Apply
              </Button>
              <Button variant="outline" onClick={onCancelCrop} className="flex-1">
                <X className="mr-2 h-4 w-4"/>
                Cancel
              </Button>
            </div>
          </div>);
            case "rotate":
                return (<div className="space-y-4">
            <h3 className="font-semibold text-foreground">Rotate & Flip</h3>
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Rotate</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => onRotate(-90)}>
                  <RotateCcw className="mr-2 h-4 w-4"/>
                  Left 90°
                </Button>
                <Button variant="outline" onClick={() => onRotate(90)}>
                  <RotateCw className="mr-2 h-4 w-4"/>
                  Right 90°
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Flip</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={state.flipX ? "secondary" : "outline"} onClick={() => onFlip("horizontal")}>
                  <FlipHorizontal className="mr-2 h-4 w-4"/>
                  Horizontal
                </Button>
                <Button variant={state.flipY ? "secondary" : "outline"} onClick={() => onFlip("vertical")}>
                  <FlipVertical className="mr-2 h-4 w-4"/>
                  Vertical
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Current Rotation</p>
              <p className="text-sm font-medium">{state.rotation}°</p>
            </div>
          </div>);
            case "adjust":
                return (<div className="space-y-6">
            <h3 className="font-semibold text-foreground">Adjustments</h3>
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Brightness</Label>
                  <span className="text-xs text-muted-foreground">{state.brightness}%</span>
                </div>
                <Slider value={[state.brightness]} onValueChange={([value]) => onStateChange({ brightness: value })} min={0} max={200} step={1}/>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Contrast</Label>
                  <span className="text-xs text-muted-foreground">{state.contrast}%</span>
                </div>
                <Slider value={[state.contrast]} onValueChange={([value]) => onStateChange({ contrast: value })} min={0} max={200} step={1}/>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Saturation</Label>
                  <span className="text-xs text-muted-foreground">{state.saturation}%</span>
                </div>
                <Slider value={[state.saturation]} onValueChange={([value]) => onStateChange({ saturation: value })} min={0} max={200} step={1}/>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Blur</Label>
                  <span className="text-xs text-muted-foreground">{state.blur}px</span>
                </div>
                <Slider value={[state.blur]} onValueChange={([value]) => onStateChange({ blur: value })} min={0} max={20} step={0.5}/>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onApplyChanges} className="flex-1">
                Apply Changes
              </Button>
              <Button variant="outline" onClick={onReset} className="flex-1">
                Reset
              </Button>
            </div>
          </div>);
            case "filter":
                return (<div className="space-y-4">
            <h3 className="font-semibold text-foreground">Filters</h3>
            <div className="grid grid-cols-2 gap-3">
              {filters.map((filter) => (<button key={filter.id} onClick={() => onStateChange({ filter: filter.id })} className={`group relative overflow-hidden rounded-lg border-2 transition-all ${state.filter === filter.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-muted-foreground/50"}`}>
                  <div className={`aspect-square w-full ${filter.preview}`}/>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-xs font-medium text-white">{filter.label}</span>
                  </div>
                </button>))}
            </div>
            <Button onClick={onApplyChanges} className="w-full">
              Apply Filter
            </Button>
          </div>);
            case "resize":
                return (<div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resize Image</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setMaintainAspectRatio(!maintainAspectRatio)} className="gap-2">
                {maintainAspectRatio ? (<Link2 className="h-4 w-4"/>) : (<Link2Off className="h-4 w-4"/>)}
                {maintainAspectRatio ? "Linked" : "Unlinked"}
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Width (px)</Label>
                <Input type="number" value={resizeWidth} onChange={(e) => handleWidthChange(e.target.value)} min={1}/>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Height (px)</Label>
                <Input type="number" value={resizeHeight} onChange={(e) => handleHeightChange(e.target.value)} min={1}/>
              </div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Original Size</p>
              <p className="text-sm font-medium">
                {state.width} × {state.height} px
              </p>
            </div>
            <Button onClick={() => onResize(resizeWidth, resizeHeight)} className="w-full">
              Apply Resize
            </Button>
          </div>);
            case "text":
                return (<div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-primary"/>
              <h3 className="font-semibold text-foreground">Add Text</h3>
            </div>
            <Input value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Type something"/>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Size</Label>
                <Input type="number" min={12} value={textSize} onChange={(e) => setTextSize(Number(e.target.value))}/>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}/>
              </div>
            </div>
            <Button onClick={() => onAddLayer({
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
                    })}>
              Add Text Layer
            </Button>
          </div>);
            case "shape":
                return (<div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shapes className="h-4 w-4 text-primary"/>
              <h3 className="font-semibold text-foreground">Shapes</h3>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <Input type="color" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)}/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => onAddLayer({
                        id: crypto.randomUUID(),
                        type: "rect",
                        x: 120,
                        y: 120,
                        width: 220,
                        height: 140,
                        fill: shapeColor,
                        opacity: 1,
                    })}>
                Rectangle
              </Button>
              <Button variant="outline" onClick={() => onAddLayer({
                        id: crypto.randomUUID(),
                        type: "circle",
                        x: 200,
                        y: 200,
                        radius: 90,
                        fill: shapeColor,
                        opacity: 1,
                    })}>
                Circle
              </Button>
            </div>
          </div>);
            case "sticker":
                return (<div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sticker className="h-4 w-4 text-primary"/>
              <h3 className="font-semibold text-foreground">Stickers</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 text-2xl">
              {["✨", "🔥", "💎", "🚀", "🎯", "✅", "🌈", "⚡"].map((emoji) => (<button key={emoji} className="rounded-lg border border-border/60 bg-background/60 p-2" onClick={() => onAddLayer({
                            id: crypto.randomUUID(),
                            type: "sticker",
                            x: 140,
                            y: 140,
                            text: emoji,
                            fontSize: 48,
                            opacity: 1,
                            align: "center",
                        })}>
                  {emoji}
                </button>))}
            </div>
          </div>);
            case "layers":
                return (<div className="space-y-4">
            <h3 className="font-semibold text-foreground">Layers</h3>
            <div className="space-y-2">
              {layers.length === 0 ? (<p className="text-sm text-muted-foreground">No layers yet.</p>) : (layers
                        .slice()
                        .reverse()
                        .map((layer) => (<div key={layer.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${activeLayerId === layer.id
                            ? "border-primary bg-primary/10"
                            : "border-border/60"}`}>
                      <button onClick={() => onSelectLayer(layer.id)} className="flex-1 text-left">
                        {layer.type.toUpperCase()} · {layer.id.slice(0, 4)}
                      </button>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onMoveLayer(layer.id, "up")} className="rounded border border-border/60 p-1">
                          <ArrowUp className="h-3 w-3"/>
                        </button>
                        <button onClick={() => onMoveLayer(layer.id, "down")} className="rounded border border-border/60 p-1">
                          <ArrowDown className="h-3 w-3"/>
                        </button>
                        <button onClick={() => onRemoveLayer(layer.id)} className="rounded border border-border/60 p-1 text-destructive">
                          <Trash2 className="h-3 w-3"/>
                        </button>
                      </div>
                    </div>)))}
            </div>
            {activeLayer && (<div className="space-y-4 rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Layer Properties</span>
                  <span>{activeLayer.type.toUpperCase()}</span>
                </div>
                {(activeLayer.type === "text" || activeLayer.type === "sticker") && (<div className="space-y-3">
                    <Input value={activeLayer.text || ""} onChange={(event) => onUpdateLayer(activeLayer.id, { text: event.target.value })} placeholder="Layer text"/>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Font</Label>
                        <select value={activeLayer.fontFamily || "Space Grotesk"} onChange={(event) => onUpdateLayer(activeLayer.id, {
                                fontFamily: event.target.value,
                            })} className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
                          {fontOptions.map((font) => (<option key={font} value={font}>
                              {font}
                            </option>))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Size</Label>
                        <Input type="number" min={12} value={activeLayer.fontSize || 32} onChange={(event) => onUpdateLayer(activeLayer.id, {
                                fontSize: Number(event.target.value),
                            })}/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Color</Label>
                        <Input type="color" value={activeLayer.fill || "#ffffff"} onChange={(event) => onUpdateLayer(activeLayer.id, { fill: event.target.value })}/>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Alignment</Label>
                        <div className="flex gap-2">
                          <Button variant={activeLayer.align === "left" ? "secondary" : "outline"} size="icon" onClick={() => onUpdateLayer(activeLayer.id, { align: "left" })}>
                            <AlignLeft className="h-4 w-4"/>
                          </Button>
                          <Button variant={activeLayer.align === "center" ? "secondary" : "outline"} size="icon" onClick={() => onUpdateLayer(activeLayer.id, { align: "center" })}>
                            <AlignCenter className="h-4 w-4"/>
                          </Button>
                          <Button variant={activeLayer.align === "right" ? "secondary" : "outline"} size="icon" onClick={() => onUpdateLayer(activeLayer.id, { align: "right" })}>
                            <AlignRight className="h-4 w-4"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>)}
                {(activeLayer.type === "rect" || activeLayer.type === "circle") && (<div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Fill</Label>
                    <Input type="color" value={activeLayer.fill || "#22d3ee"} onChange={(event) => onUpdateLayer(activeLayer.id, { fill: event.target.value })}/>
                  </div>)}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Opacity</Label>
                  <Slider value={[Math.round((activeLayer.opacity ?? 1) * 100)]} onValueChange={([value]) => onUpdateLayer(activeLayer.id, { opacity: value / 100 })} min={10} max={100} step={1}/>
                </div>
              </div>)}
          </div>);
            case "preset":
                return (<div className="space-y-4">
            <h3 className="font-semibold text-foreground">Social Presets</h3>
            <div className="space-y-2">
              {presets.map((preset) => (<button key={preset.id} onClick={() => onApplyPreset(preset)} className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm">
                  <span>{preset.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {preset.width} x {preset.height}
                  </span>
                </button>))}
            </div>
          </div>);
            default:
                return (<div className="flex h-full flex-col items-center justify-center text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Select a tool from the toolbar to start editing
              </p>
            </div>
          </div>);
        }
    };
    return (<div className="flex h-full w-64 flex-col border-l border-border bg-card">
      <div className="border-b border-border p-3">
        <h2 className="text-sm font-semibold text-foreground">Tools</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">{renderContent()}</div>
      </ScrollArea>
    </div>);
}
