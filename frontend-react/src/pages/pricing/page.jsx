"use client";
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
    return (<AppShell>
      <div className="grid gap-8">
        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-display text-3xl font-semibold">Pricing</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Flexible plans for solo creators and distributed teams.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (<div key={plan.name} className="glass-card rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">{plan.name}</p>
              <p className="mt-3 text-3xl font-semibold">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (<li key={feature}>{feature}</li>))}
              </ul>
              <button className="mt-6 w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Choose {plan.name}
              </button>
            </div>))}
        </section>
      </div>
    </AppShell>);
}
