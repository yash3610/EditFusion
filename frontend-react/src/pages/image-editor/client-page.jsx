"use client";
import { Suspense, lazy } from "react";
const ImageEditor = lazy(() => import("@/components/image-editor").then((mod) => ({ default: mod.ImageEditor })));
export default function ImageEditorClientPage() {
    return (<Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Loading editor...
        </div>}>
      <ImageEditor />
    </Suspense>);
}
