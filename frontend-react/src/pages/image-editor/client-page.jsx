"use client";
import { Suspense, lazy } from "react";
const ImageEditor = lazy(() => import("@/components/image-editor").then((mod) => ({ default: mod.ImageEditor })));
export default function ImageEditorClientPage() {
    return (<Suspense fallback={<div className="flex h-[calc(100vh-8rem)] min-h-[640px] items-center justify-center rounded-xl border border-border bg-background text-sm text-muted-foreground">
          Loading editor...
        </div>}>
      <ImageEditor />
    </Suspense>);
}
