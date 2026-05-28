"use client";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/auth/auth-provider";
export default function ProfilePage() {
    const { user, logout } = useAuth();
    return (<AppShell>
      <div className="grid gap-8">
        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-display text-3xl font-semibold">Profile</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage your account and preferences.
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/20"/>
            <div>
              <p className="text-lg font-semibold">{user?.name || "Guest"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || "Not signed in"}</p>
            </div>
          </div>
          <button className="mt-6 rounded-lg border border-border/60 px-4 py-2 text-sm" onClick={logout}>
            Sign out
          </button>
        </section>
      </div>
    </AppShell>);
}
