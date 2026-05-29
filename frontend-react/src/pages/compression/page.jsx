"use client";
import { AppShell } from "@/components/layout/app-shell";
import { CompressionDashboard } from "@/features/compression/components/CompressionDashboard";

export default function CompressionPage() {
  return (
    <AppShell>
      <CompressionDashboard />
    </AppShell>
  );
}
