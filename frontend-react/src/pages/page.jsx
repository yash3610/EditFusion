"use client";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Workflow } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
const stats = [
    { label: "AI powered tools", value: "28+" },
    { label: "Export formats", value: "15" },
    { label: "Average render time", value: "1.4s" },
];
const features = [
    {
        title: "Precision image editing",
        description: "Craft visuals with pro-grade filters, layers, and social presets built for teams and creators.",
    },
    {
        title: "PDF studio",
        description: "Merge, split, rotate, annotate, and compress PDFs without leaving your workspace.",
    },
    {
        title: "Universal converter",
        description: "Move between formats instantly with batch-friendly exports and device presets.",
    },
];
export default function Home() {
    return (<div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-900 shadow-lg">
              EF
            </div>
            <span className="text-lg font-semibold">EditFusion</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link to="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link to="/login" className="hover:text-foreground">
              Login
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5"/>
              All-in-one creative suite
            </div>
            <h1 className="text-display text-4xl font-semibold leading-tight md:text-5xl">
              The premium workspace for AI image editing, PDF tools, and file conversion.
            </h1>
            <p className="text-lg text-muted-foreground">
              EditFusion blends modern design with production-ready tooling. Build, polish, and ship assets faster with one unified dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow">
                Launch dashboard
              </Link>
              <Link to="/image-editor" className="rounded-full border border-border/70 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/60">
                Try image editor
              </Link>
            </div>
            <div className="grid gap-6 pt-6 md:grid-cols-3">
              {stats.map((stat) => (<div key={stat.label} className="glass-card rounded-2xl p-4">
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                </div>))}
            </div>
          </div>

          <div className="glass-card relative rounded-3xl border border-border/70 p-6">
            <div className="absolute -right-6 top-8 hidden h-28 w-28 rounded-3xl border border-border/50 bg-gradient-to-br from-emerald-300/40 to-cyan-400/10 blur-2xl lg:block"/>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Unified Creative Board</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <p className="text-xs text-muted-foreground">Active project</p>
                <p className="mt-2 text-lg font-semibold">Brand Launch Kit</p>
                <p className="text-sm text-muted-foreground">5 assets · 2 PDFs · 1 converter flow</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                  <p className="text-sm font-semibold">AI Enhancer</p>
                  <p className="text-xs text-muted-foreground">Clean, upscale, and auto-fix</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                  <p className="text-sm font-semibold">PDF Studio</p>
                  <p className="text-xs text-muted-foreground">Review and sign instantly</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-400/20 via-transparent to-cyan-400/10 p-4">
                <p className="text-sm font-semibold">Realtime export pipeline</p>
                <p className="text-xs text-muted-foreground">PNG · PDF · WebP · SVG · Docx</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (<div key={feature.title} className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
              </div>))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="glass-card grid gap-6 rounded-3xl p-8 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-5 w-5 text-primary"/>
              <div>
                <p className="text-sm font-semibold">Secure by design</p>
                <p className="text-xs text-muted-foreground">
                  JWT auth, rate limiting, and secure uploads.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Workflow className="mt-1 h-5 w-5 text-primary"/>
              <div>
                <p className="text-sm font-semibold">Optimized workflows</p>
                <p className="text-xs text-muted-foreground">
                  Drag-and-drop uploads with autosave and history.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-primary"/>
              <div>
                <p className="text-sm font-semibold">AI acceleration</p>
                <p className="text-xs text-muted-foreground">
                  Background removal, enhancement, and stylized filters.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>);
}
