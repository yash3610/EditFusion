"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { API_URL } from "@/lib/api";
import { Sparkles } from "lucide-react";
const uploadImage = async (file, endpoint, extraFields) => {
    const formData = new FormData();
    formData.append("file", file);
    if (extraFields) {
        Object.entries(extraFields).forEach(([key, value]) => {
            formData.append(key, value);
        });
    }
    const token = localStorage.getItem("ef_token");
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || "Upload failed");
    }
    return data;
};
export default function AiToolsPage() {
    const [file, setFile] = useState(null);
    const [resultUrl, setResultUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [removePrompt, setRemovePrompt] = useState("logo");
    const handleAction = async (endpoint, fields) => {
        if (!file)
            return;
        setIsLoading(true);
        try {
            const data = await uploadImage(file, endpoint, fields);
            setResultUrl(data.url);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<AppShell>
      <div className="grid gap-8">
        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-display text-3xl font-semibold">AI Image Tools</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Remove backgrounds, enhance clarity, and stylize images with cloud AI.
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary"/>
            <h3 className="text-lg font-semibold">AI Enhancer Suite</h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.7fr]">
            <div className="space-y-4">
              <input type="file" accept="image/*" className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" onChange={(event) => setFile(event.target.files?.[0] || null)}/>
              <div className="grid gap-3 md:grid-cols-3">
                <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" onClick={() => handleAction("/api/ai/background-remove")} disabled={isLoading}>
                  Remove BG
                </button>
                <button className="rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground" onClick={() => handleAction("/api/ai/enhance")} disabled={isLoading}>
                  Enhance
                </button>
                <button className="rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground" onClick={() => handleAction("/api/ai/cartoon")} disabled={isLoading}>
                  Cartoon
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <button className="rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground" onClick={() => handleAction("/api/ai/anime")} disabled={isLoading}>
                  Anime
                </button>
                <button className="rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground" onClick={() => handleAction("/api/ai/sketch")} disabled={isLoading}>
                  Sketch
                </button>
                <button className="rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground" onClick={() => handleAction("/api/ai/object-remove", { prompt: removePrompt })} disabled={isLoading}>
                  Object Remove
                </button>
              </div>
              <input type="text" value={removePrompt} onChange={(event) => setRemovePrompt(event.target.value)} className="w-full rounded-lg border border-border/60 bg-background/60 p-2 text-sm" placeholder="Object to remove (e.g., logo, person)"/>
              <p className="text-xs text-muted-foreground">
                Powered by Cloudinary transformations. Upload an image and run a tool.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-4">
              {resultUrl ? (<img src={resultUrl} alt="AI result" className="w-full rounded-lg"/>) : (<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  AI result preview appears here.
                </div>)}
            </div>
          </div>
        </section>
      </div>
    </AppShell>);
}
