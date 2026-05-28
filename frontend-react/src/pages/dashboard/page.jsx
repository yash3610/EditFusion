"use client";
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
    return (<AppShell>
      <div className="grid gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass-card rounded-3xl p-8">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h2 className="text-display mt-3 text-3xl font-semibold">
              Your creative control room
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Launch a new project or pick up where you left off. Every tool is
              connected for smooth, fast delivery.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/image-editor" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow">
                Start editing
              </Link>
              <Link to="/projects" className="rounded-full border border-border/60 px-5 py-2 text-sm text-foreground transition hover:bg-muted/60">
                View projects
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary"/>
                <p className="text-sm font-semibold">Recent activity</p>
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Updated "Brand Launch Kit" PDF bundle</p>
                <p>Exported Instagram campaign assets</p>
                <p>Enhanced portrait using AI Enhancer</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-4 w-4 text-primary"/>
                <p className="text-sm font-semibold">Saved projects</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Keep your edits synced across devices and teams.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (<Link key={tool.title} to={tool.href} className="glass-card rounded-2xl p-5 transition hover:-translate-y-1">
                <Icon className="h-5 w-5 text-primary"/>
                <h3 className="mt-4 text-lg font-semibold">{tool.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tool.description}
                </p>
              </Link>);
        })}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card rounded-2xl p-6">
            <p className="text-sm font-semibold">Recent files</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {recentFiles.length === 0 ? (<p>No recent files yet.</p>) : (recentFiles.map((item) => (<div key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-xs">{new Date(item.time).toLocaleDateString()}</span>
                  </div>)))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <p className="text-sm font-semibold">Download history</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {downloads.length === 0 ? (<p>No downloads yet.</p>) : (downloads.map((item) => (<div key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-xs">{new Date(item.time).toLocaleDateString()}</span>
                  </div>)))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>);
}
