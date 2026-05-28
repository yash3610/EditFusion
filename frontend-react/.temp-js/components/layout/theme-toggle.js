"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return (_jsx("button", { type: "button", className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground", "aria-label": "Toggle theme", disabled: true, children: _jsx("span", { className: "h-4 w-4", "aria-hidden": "true" }) }));
    }
    const isDark = resolvedTheme === "dark";
    return (_jsx("button", { type: "button", className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground transition hover:text-foreground", onClick: () => setTheme(isDark ? "light" : "dark"), "aria-label": "Toggle theme", children: isDark ? _jsx(Sun, { className: "h-4 w-4" }) : _jsx(Moon, { className: "h-4 w-4" }) }));
}
