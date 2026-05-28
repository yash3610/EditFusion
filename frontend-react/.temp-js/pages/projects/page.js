"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { apiFetch } from "@/lib/api";
export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiFetch("/api/projects");
                setProjects(data);
            }
            catch {
                setProjects([]);
            }
        };
        load();
    }, []);
    return (_jsx(AppShell, { children: _jsxs("div", { className: "grid gap-8", children: [_jsxs("section", { className: "glass-card rounded-3xl p-8", children: [_jsx("h2", { className: "text-display text-3xl font-semibold", children: "Saved Projects" }), _jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Continue where you left off with every asset synced." })] }), _jsx("section", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: projects.length === 0 ? (_jsx("div", { className: "glass-card rounded-2xl p-6 text-sm text-muted-foreground", children: "No projects yet. Start a new workflow from the dashboard." })) : (projects.map((project) => (_jsxs("div", { className: "glass-card rounded-2xl p-5", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: project.type.toUpperCase() }), _jsx("span", { children: new Date(project.updatedAt).toLocaleDateString() })] }), _jsx("h3", { className: "mt-4 text-lg font-semibold", children: project.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: project.status })] }, project._id)))) })] }) }));
}
