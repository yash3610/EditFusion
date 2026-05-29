"use client";
import { PropsWithChildren } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";
import { LayoutGrid, Image as ImageIcon, FileText, Sparkles, Repeat, FolderOpen, UserCircle, CreditCard, SlidersHorizontal, } from "lucide-react";
const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/image-editor", label: "Image Editor", icon: ImageIcon },
    { href: "/pdf-tools", label: "PDF Tools", icon: FileText },
    { href: "/converter", label: "Converter", icon: Repeat },
    { href: "/ai-tools", label: "AI Tools", icon: Sparkles },
    { href: "/compression", label: "Compression", icon: SlidersHorizontal },
    { href: "/projects", label: "Saved Projects", icon: FolderOpen },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: UserCircle },
];
export function AppShell({ children }) {
    const location = useLocation();
    const pathname = location.pathname;
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
    return (<div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-teal-400/15 via-transparent to-transparent"/>
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/80 p-6 backdrop-blur xl:flex">
          <Link to="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-cyan-500 text-slate-900 shadow-lg">
              EF
            </div>
            <div>
              <p className="text-lg font-semibold">EditFusion</p>
              <p className="text-xs text-muted-foreground">Creative Suite</p>
            </div>
          </Link>
          <nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (<Link key={item.href} to={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition", isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}>
                  <Icon className="h-4 w-4"/>
                  {item.label}
                </Link>);
        })}
          </nav>
          <div className="mt-6 rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Pro Tip</p>
            <p className="mt-2">Use keyboard shortcuts to speed up edits.</p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col xl:ml-64">
          <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">EditFusion Workspace</p>
                <h1 className="text-lg font-semibold">Your Creative Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                {token ? (<>
                  <Link to="/profile" className="rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground">
                    {user?.name || "Profile"}
                  </Link>
                  <button type="button" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow" onClick={() => {
                        logout();
                        navigate("/");
                    }}>
                    Log Out
                  </button>
                </>) : (<>
                  <Link to="/login" className="rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground">
                    Sign In
                  </Link>
                  <Link to="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow">
                    Start Free
                  </Link>
                </>)}
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6 xl:px-10">{children}</main>
        </div>
      </div>
    </div>);
}
