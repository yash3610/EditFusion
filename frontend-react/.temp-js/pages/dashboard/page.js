"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Image as ImageIcon, FileText, Sparkles, Repeat, Clock, FolderOpen, } from "lucide-react";
import { getDownloadHistory, getRecentFiles } from "@/lib/history";
const tools = [
    {
        title: "Image Editor",
        description: "Filters, layers, crop, resize, and pro exports.",
        href: "/image-editor",
        icon: ImageIcon,
    },
    {
        title: "PDF Studio",
        description: "Merge, split, rotate, watermark, annotate.",
        href: "/pdf-tools",
        icon: FileText,
    },
    {
        title: "Converter",
        description: "Image and document conversions with presets.",
        href: "/converter",
        icon: Repeat,
    },
    {
        title: "AI Tools",
        description: "Background removal, enhancement, and stylization.",
        href: "/ai-tools",
        icon: Sparkles,
    },
];
export default function DashboardPage() {
    const [recentFiles, setRecentFiles] = useState([]);
    const [downloads, setDownloads] = useState([]);
    useEffect(() => {
        setRecentFiles(getRecentFiles());
        setDownloads(getDownloadHistory());
    }, []);
    return (_jsx(AppShell, { children: _jsxs("div", { className: "grid gap-8", children: [_jsxs("section", { className: "grid gap-6 lg:grid-cols-[1.4fr_1fr]", children: [_jsxs("div", { className: "glass-card rounded-3xl p-8", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Welcome back" }), _jsx("h2", { className: "text-display mt-3 text-3xl font-semibold", children: "Your creative control room" }), _jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Launch a new project or pick up where you left off. Every tool is connected for smooth, fast delivery." }), _jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [_jsx(Link, { to: "/image-editor", className: "rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow", children: "Start editing" }), _jsx(Link, { to: "/projects", className: "rounded-full border border-border/60 px-5 py-2 text-sm text-foreground transition hover:bg-muted/60", children: "View projects" })] })] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "glass-card rounded-2xl p-5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "h-4 w-4 text-primary" }), _jsx("p", { className: "text-sm font-semibold", children: "Recent activity" })] }), _jsxs("div", { className: "mt-4 space-y-3 text-sm text-muted-foreground", children: [_jsx("p", { children: "Updated \"Brand Launch Kit\" PDF bundle" }), _jsx("p", { children: "Exported Instagram campaign assets" }), _jsx("p", { children: "Enhanced portrait using AI Enhancer" })] })] }), _jsxs("div", { className: "glass-card rounded-2xl p-5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FolderOpen, { className: "h-4 w-4 text-primary" }), _jsx("p", { className: "text-sm font-semibold", children: "Saved projects" })] }), _jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Keep your edits synced across devices and teams." })] })] })] }), _jsx("section", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: tools.map((tool) => {
                        const Icon = tool.icon;
                        return (_jsxs(Link, { to: tool.href, className: "glass-card rounded-2xl p-5 transition hover:-translate-y-1", children: [_jsx(Icon, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "mt-4 text-lg font-semibold", children: tool.title }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: tool.description })] }, tool.title));
                    }) }), _jsxs("section", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs("div", { className: "glass-card rounded-2xl p-6", children: [_jsx("p", { className: "text-sm font-semibold", children: "Recent files" }), _jsx("div", { className: "mt-4 space-y-3 text-sm text-muted-foreground", children: recentFiles.length === 0 ? (_jsx("p", { children: "No recent files yet." })) : (recentFiles.map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: item.name }), _jsx("span", { className: "text-xs", children: new Date(item.time).toLocaleDateString() })] }, item.id)))) })] }), _jsxs("div", { className: "glass-card rounded-2xl p-6", children: [_jsx("p", { className: "text-sm font-semibold", children: "Download history" }), _jsx("div", { className: "mt-4 space-y-3 text-sm text-muted-foreground", children: downloads.length === 0 ? (_jsx("p", { children: "No downloads yet." })) : (downloads.map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: item.name }), _jsx("span", { className: "text-xs", children: new Date(item.time).toLocaleDateString() })] }, item.id)))) })] })] })] }) }));
}
