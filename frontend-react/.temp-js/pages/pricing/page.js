"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppShell } from "@/components/layout/app-shell";
const plans = [
    {
        name: "Starter",
        price: "$0",
        features: ["5 projects", "Basic exports", "Community support"],
    },
    {
        name: "Pro",
        price: "$19",
        features: ["Unlimited projects", "AI tools", "Team collaboration"],
    },
    {
        name: "Studio",
        price: "$39",
        features: ["Priority AI", "Advanced PDF flows", "Dedicated support"],
    },
];
export default function PricingPage() {
    return (_jsx(AppShell, { children: _jsxs("div", { className: "grid gap-8", children: [_jsxs("section", { className: "glass-card rounded-3xl p-8", children: [_jsx("h2", { className: "text-display text-3xl font-semibold", children: "Pricing" }), _jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Flexible plans for solo creators and distributed teams." })] }), _jsx("section", { className: "grid gap-6 md:grid-cols-3", children: plans.map((plan) => (_jsxs("div", { className: "glass-card rounded-2xl p-6", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: plan.name }), _jsx("p", { className: "mt-3 text-3xl font-semibold", children: plan.price }), _jsx("ul", { className: "mt-4 space-y-2 text-sm text-muted-foreground", children: plan.features.map((feature) => (_jsx("li", { children: feature }, feature))) }), _jsxs("button", { className: "mt-6 w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", children: ["Choose ", plan.name] })] }, plan.name))) })] }) }));
}
