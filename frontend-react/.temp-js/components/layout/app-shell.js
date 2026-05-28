"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LayoutGrid, Image as ImageIcon, FileText, Sparkles, Repeat, FolderOpen, UserCircle, CreditCard, } from "lucide-react";
const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/image-editor", label: "Image Editor", icon: ImageIcon },
    { href: "/pdf-tools", label: "PDF Tools", icon: FileText },
    { href: "/converter", label: "Converter", icon: Repeat },
    { href: "/ai-tools", label: "AI Tools", icon: Sparkles },
    { href: "/projects", label: "Saved Projects", icon: FolderOpen },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: UserCircle },
];
export function AppShell({ children }) {
    const location = useLocation();
    const pathname = location.pathname;
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx("div", { className: "pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-teal-400/15 via-transparent to-transparent" }), _jsxs("div", { className: "flex min-h-screen", children: [_jsxs("aside", { className: "hidden w-64 flex-col border-r border-border/60 bg-card/80 p-6 backdrop-blur xl:flex", children: [_jsxs(Link, { to: "/", className: "mb-8 flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-900 shadow-lg", children: "EF" }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold", children: "EditFusion" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Creative Suite" })] })] }), _jsx("nav", { className: "flex flex-1 flex-col gap-2", children: navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (_jsxs(Link, { to: item.href, className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition", isActive
                                            ? "bg-primary text-primary-foreground shadow"
                                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"), children: [_jsx(Icon, { className: "h-4 w-4" }), item.label] }, item.href));
                                }) }), _jsxs("div", { className: "mt-6 rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground", children: [_jsx("p", { className: "font-semibold text-foreground", children: "Pro Tip" }), _jsx("p", { className: "mt-2", children: "Use keyboard shortcuts to speed up edits." })] })] }), _jsxs("div", { className: "flex min-h-screen flex-1 flex-col", children: [_jsx("header", { className: "sticky top-0 z-20 border-b border-border/60 bg-background/70 px-6 py-4 backdrop-blur", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "EditFusion Workspace" }), _jsx("h1", { className: "text-lg font-semibold", children: "Your Creative Dashboard" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/login", className: "rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground", children: "Sign In" }), _jsx(Link, { to: "/register", className: "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow", children: "Start Free" }), _jsx(ThemeToggle, {})] })] }) }), _jsx("main", { className: "flex-1 px-6 py-6 xl:px-10", children: children })] })] })] }));
}
