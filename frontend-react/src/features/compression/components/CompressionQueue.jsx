"use client";
import { Layers, GripVertical } from "lucide-react";
import { QueueItemCard } from "./QueueItemCard";

export const CompressionQueue = ({ items, selectedId, onSelect, onRemove, onCompress, onDownload, onReorder }) => {
  const handleDragStart = (index) => (event) => {
    event.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (index) => (event) => {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isNaN(fromIndex) || fromIndex === index) return;
    onReorder(fromIndex, index);
  };

  return (
    <section className="glass-card rounded-2xl border border-border/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Compression queue</p>
            <p className="text-xs text-muted-foreground">Drag to reorder, optimize individually, or download.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GripVertical className="h-4 w-4" /> Drag cards to reorder
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 xl:auto-rows-fr">
        {items.map((item, index) => (
          <QueueItemCard
            key={item.id}
            item={item}
            isSelected={item.id === selectedId}
            onSelect={() => onSelect(item.id)}
            onRemove={() => onRemove(item.id)}
            onCompress={() => onCompress(item.id)}
            onDownload={() => onDownload(item)}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(index)}
          />
        ))}
      </div>
    </section>
  );
};
