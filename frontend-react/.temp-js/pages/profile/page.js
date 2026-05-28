"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/auth/auth-provider";
export default function ProfilePage() {
    const { user, logout } = useAuth();
    return (_jsx(AppShell, { children: _jsxs("div", { className: "grid gap-8", children: [_jsxs("section", { className: "glass-card rounded-3xl p-8", children: [_jsx("h2", { className: "text-display text-3xl font-semibold", children: "Profile" }), _jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Manage your account and preferences." })] }), _jsxs("section", { className: "glass-card rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-14 w-14 rounded-full bg-primary/20" }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold", children: user?.name || "Guest" }), _jsx("p", { className: "text-sm text-muted-foreground", children: user?.email || "Not signed in" })] })] }), _jsx("button", { className: "mt-6 rounded-lg border border-border/60 px-4 py-2 text-sm", onClick: logout, children: "Sign out" })] })] }) }));
}
