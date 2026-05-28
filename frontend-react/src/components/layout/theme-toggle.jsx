"use client";
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
        return (<button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground" aria-label="Toggle theme" disabled>
        <span className="h-4 w-4" aria-hidden="true"/>
      </button>);
    }
    const isDark = resolvedTheme === "dark";
    return (<button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground transition hover:text-foreground" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle theme">
      {isDark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
    </button>);
}
