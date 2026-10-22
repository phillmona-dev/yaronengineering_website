"use client";

import { Network, Server, ShieldCheck, Cloud } from "lucide-react";
import { Counter } from "@/components/animations/Counter";
import { useSiteContent } from "@/lib/content/context";

const PILLARS = [
  { icon: Network, label: "Network" },
  { icon: Server, label: "Data center" },
  { icon: ShieldCheck, label: "Security" },
  { icon: Cloud, label: "Cloud" },
];

/** Capability card shown beside the home-hero headline: the headline figure + four pillars. */
export function HeroPanel() {
  const { home } = useSiteContent();
  const projects = home.stats[0];
  const others = home.stats.slice(1, 4);

  return (
    <div className="grid gap-3">
      <div className="border-sky-200 bg-sky-100 relative overflow-hidden rounded-xl border p-6 shadow-[0_32px_80px_-32px_rgba(15,17,20,0.16),0_1px_0_rgba(255,255,255,0.9)_inset] sm:p-8">
        <div aria-hidden className="bg-gold-500 absolute inset-x-0 top-0 h-1" />
        <div
          aria-hidden
          className="absolute -top-20 -right-20 size-56 rounded-full opacity-70 blur-3xl"
          style={{
            background: "radial-gradient(closest-side, rgba(245,197,24,0.35), transparent 70%)",
          }}
        />
        <p className="text-muted-foreground font-label relative text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
          {home.hero.panelNote}
        </p>
        <p className="text-gold-700 font-display relative mt-3 text-[clamp(3.5rem,2rem+4vw,5.5rem)] leading-none font-bold tracking-[-0.03em]">
          <Counter value={projects.value} suffix={projects.suffix} />
        </p>
        <p className="text-foreground text-body relative mt-2">{home.hero.panelText}</p>

        <dl className="border-sky-200/80 relative mt-6 grid grid-cols-3 gap-3 border-t pt-5">
          {others.map((s) => (
            <div key={s.label}>
              <dt className="text-muted-foreground font-label text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                {s.label}
              </dt>
              <dd className="font-display text-foreground mt-1 text-xl font-bold">
                <Counter value={s.value} suffix={s.suffix} plain={s.plain} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
        {PILLARS.map((p) => (
          <li
            key={p.label}
            className="border-sky-200 bg-sky-100 hover:border-gold-500/60 hover:bg-sky-50 flex items-center gap-3 rounded-xl border px-4 py-3.5 shadow-[0_12px_30px_-18px_rgba(15,17,20,0.12)] transition-colors"
          >
            <span className="bg-white/80 grid size-8 shrink-0 place-items-center rounded-lg shadow-xs">
              <p.icon className="text-gold-700 size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="text-foreground text-body font-medium">{p.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
