"use client";
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
    return (<AppShell>
      <div className="grid gap-8">
        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-display text-3xl font-semibold">Saved Projects</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Continue where you left off with every asset synced.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.length === 0 ? (<div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
              No projects yet. Start a new workflow from the dashboard.
            </div>) : (projects.map((project) => (<div key={project._id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.type.toUpperCase()}</span>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{project.name}</h3>
                <p className="text-xs text-muted-foreground">{project.status}</p>
              </div>)))}
        </section>
      </div>
    </AppShell>);
}
