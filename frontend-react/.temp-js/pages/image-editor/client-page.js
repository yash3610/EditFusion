"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense, lazy } from "react";
const ImageEditor = lazy(() => import("@/components/image-editor").then((mod) => ({ default: mod.ImageEditor })));
export default function ImageEditorClientPage() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground", children: "Loading editor..." }), children: _jsx(ImageEditor, {}) }));
}
