"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Stage, Layer, Text, Rect, Circle, Transformer } from "react-konva";
export function Canvas({ image, state, canvasRef, stageRef, layers, activeLayerId, onSelectLayer, onUpdateLayer, isCropping, onCropAreaChange, }) {
    const containerRef = useRef(null);
    const [cropStart, setCropStart] = useState(null);
    const [currentCrop, setCurrentCrop] = useState(null);
    const [cropInteraction, setCropInteraction] = useState(null);
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
    const clampCrop = useCallback((crop) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return crop;
        const minSize = 12;
        const x = Math.max(0, Math.min(crop.x, canvas.width - minSize));
        const y = Math.max(0, Math.min(crop.y, canvas.height - minSize));
        const width = Math.max(minSize, Math.min(crop.width, canvas.width - x));
        const height = Math.max(minSize, Math.min(crop.height, canvas.height - y));
        return { x, y, width, height };
    }, [canvasRef]);
    const getCanvasPoint = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return null;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / scale,
            y: (event.clientY - rect.top) / scale,
        };
    }, [canvasRef, scale]);
    const buildResizedCrop = useCallback((startCrop, point, mode) => {
        let left = startCrop.x;
        let top = startCrop.y;
        let right = startCrop.x + startCrop.width;
        let bottom = startCrop.y + startCrop.height;
        if (mode.includes("w"))
            left = point.x;
        if (mode.includes("e"))
            right = point.x;
        if (mode.includes("n"))
            top = point.y;
        if (mode.includes("s"))
            bottom = point.y;
        const x = Math.min(left, right);
        const y = Math.min(top, bottom);
        return clampCrop({
            x,
            y,
            width: Math.abs(right - left),
            height: Math.abs(bottom - top),
        });
    }, [clampCrop]);
    useEffect(() => {
        if (!cropInteraction)
            return undefined;
        const handleMove = (event) => {
            const point = getCanvasPoint(event);
            if (!point)
                return;
            if (cropInteraction.mode === "move") {
                const dx = point.x - cropInteraction.startPoint.x;
                const dy = point.y - cropInteraction.startPoint.y;
                onCropAreaChange(clampCrop({
                    ...cropInteraction.startCrop,
                    x: cropInteraction.startCrop.x + dx,
                    y: cropInteraction.startCrop.y + dy,
                }));
                return;
            }
            onCropAreaChange(buildResizedCrop(cropInteraction.startCrop, point, cropInteraction.mode));
        };
        const handleEnd = () => setCropInteraction(null);
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleEnd);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleEnd);
        };
    }, [buildResizedCrop, clampCrop, cropInteraction, getCanvasPoint, onCropAreaChange]);
    const startCropInteraction = useCallback((event, mode) => {
        event.preventDefault();
        event.stopPropagation();
        if (!state.cropArea)
            return;
        const point = getCanvasPoint(event);
        if (!point)
            return;
        setCropInteraction({
            mode,
            startPoint: point,
            startCrop: state.cropArea,
        });
    }, [getCanvasPoint, state.cropArea]);
    const handleMouseDown = useCallback((e) => {
        if (!isCropping)
            return;
        if (cropInteraction)
            return;
        const point = getCanvasPoint(e);
        if (!point)
            return;
        const { x, y } = point;
        setCropStart({ x, y });
        onCropAreaChange(null);
        setCurrentCrop({ x, y, width: 0, height: 0 });
    }, [cropInteraction, getCanvasPoint, isCropping, onCropAreaChange]);
    const handleMouseMove = useCallback((e) => {
        if (!cropStart || !isCropping)
            return;
        const point = getCanvasPoint(e);
        if (!point)
            return;
        const currentX = point.x;
        const currentY = point.y;
        const x = Math.min(cropStart.x, currentX);
        const y = Math.min(cropStart.y, currentY);
        const width = Math.abs(currentX - cropStart.x);
        const height = Math.abs(currentY - cropStart.y);
        setCurrentCrop(clampCrop({ x, y, width, height }));
    }, [clampCrop, cropStart, getCanvasPoint, isCropping]);
    const handleMouseUp = useCallback(() => {
        if (currentCrop && currentCrop.width > 10 && currentCrop.height > 10) {
            onCropAreaChange(clampCrop(currentCrop));
        }
        setCropStart(null);
        setCurrentCrop(null);
    }, [clampCrop, currentCrop, onCropAreaChange]);
    if (!image) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg className="mx-auto mb-4 h-16 w-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p className="text-lg">No image loaded</p>
          <p className="text-sm">Upload an image to start editing</p>
        </div>
      </div>);
    }
    return (<div ref={containerRef} className="relative flex h-full items-center justify-center overflow-hidden p-5">
      <div className="relative" style={{ transform: `scale(${scale})` }}>
        <canvas ref={canvasRef} className={`max-w-full rounded-sm shadow-2xl ${isCropping ? "cursor-crosshair" : ""}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}/>
        <div className={`absolute inset-0 ${isCropping ? "pointer-events-none" : ""}`}>
          <Stage ref={stageRef} width={canvasRef.current?.width || state.width} height={canvasRef.current?.height || state.height} onMouseDown={(event) => {
            if (isCropping)
                return;
            if (event.target === event.target.getStage()) {
                onSelectLayer(null);
            }
        }}>
            <Layer>
              {layers.map((layer) => {
            if (layer.type === "text" || layer.type === "sticker") {
                return (<Text key={layer.id} id={layer.id} text={layer.text || ""} x={layer.x} y={layer.y} width={layer.width || 320} fontSize={layer.fontSize || 32} fontFamily={layer.fontFamily || "Space Grotesk"} fill={layer.fill || "#ffffff"} align={layer.align || "left"} opacity={layer.opacity ?? 1} rotation={layer.rotation || 0} draggable onClick={() => onSelectLayer(layer.id)} onTap={() => onSelectLayer(layer.id)} onDragEnd={(event) => onUpdateLayer(layer.id, {
                        x: event.target.x(),
                        y: event.target.y(),
                    })} onTransformEnd={(event) => {
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
                    }}/>);
            }
            if (layer.type === "rect") {
                return (<Rect key={layer.id} id={layer.id} x={layer.x} y={layer.y} width={layer.width || 200} height={layer.height || 120} fill={layer.fill || "#22d3ee"} opacity={layer.opacity ?? 1} rotation={layer.rotation || 0} cornerRadius={14} draggable onClick={() => onSelectLayer(layer.id)} onTap={() => onSelectLayer(layer.id)} onDragEnd={(event) => onUpdateLayer(layer.id, {
                        x: event.target.x(),
                        y: event.target.y(),
                    })} onTransformEnd={(event) => {
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
                    }}/>);
            }
            return (<Circle key={layer.id} id={layer.id} x={layer.x} y={layer.y} radius={layer.radius || 80} fill={layer.fill || "#34d399"} opacity={layer.opacity ?? 1} rotation={layer.rotation || 0} draggable onClick={() => onSelectLayer(layer.id)} onTap={() => onSelectLayer(layer.id)} onDragEnd={(event) => onUpdateLayer(layer.id, {
                    x: event.target.x(),
                    y: event.target.y(),
                })} onTransformEnd={(event) => {
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
                }}/>);
        })}
              <Transformer ref={transformerRef} rotateEnabled={true}/>
            </Layer>
          </Stage>
        </div>
        {isCropping && currentCrop && currentCrop.width > 0 && (<div className="pointer-events-none absolute border-2 border-dashed border-primary bg-primary/20" style={{
                left: currentCrop.x,
                top: currentCrop.y,
                width: currentCrop.width,
                height: currentCrop.height,
            }}/>)}
        {isCropping && state.cropArea && (<div className="absolute border-2 border-primary bg-primary/10" onMouseDown={(event) => startCropInteraction(event, "move")} style={{
                left: state.cropArea.x,
                top: state.cropArea.y,
                width: state.cropArea.width,
                height: state.cropArea.height,
                cursor: "move",
            }}>
            {[
                    ["nw", "-left-1.5 -top-1.5", "nwse-resize"],
                    ["n", "left-1/2 -top-1.5 -translate-x-1/2", "ns-resize"],
                    ["ne", "-right-1.5 -top-1.5", "nesw-resize"],
                    ["e", "-right-1.5 top-1/2 -translate-y-1/2", "ew-resize"],
                    ["se", "-bottom-1.5 -right-1.5", "nwse-resize"],
                    ["s", "-bottom-1.5 left-1/2 -translate-x-1/2", "ns-resize"],
                    ["sw", "-bottom-1.5 -left-1.5", "nesw-resize"],
                    ["w", "-left-1.5 top-1/2 -translate-y-1/2", "ew-resize"],
                ].map(([mode, position, cursor]) => (<button key={mode} type="button" aria-label={`Resize crop ${mode}`} className={`absolute h-4 w-4 rounded-full border-2 border-background bg-primary shadow ${position}`} style={{ cursor }} onMouseDown={(event) => startCropInteraction(event, mode)}/>))}
          </div>)}
      </div>
    </div>);
}
