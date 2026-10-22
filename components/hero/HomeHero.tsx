"use client";

import Image from "next/image";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextReveal } from "@/components/animations/TextReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { NetworkLines } from "./NetworkLines";
import { HeroOrbits } from "./HeroOrbits";
import { HeroPanel } from "./HeroPanel";
import { useSiteContent } from "@/lib/content/context";
import { GoldHighlight } from "@/lib/content/highlight";
import { EASE_OUT_EXPO } from "@/lib/utils/motion";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE_OUT_EXPO },
});

export function HomeHero() {
  const { home, customers } = useSiteContent();
  const hero = home.hero;
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 900], [0, 120]);
  const panelY = useTransform(scrollY, [0, 900], [0, -40]);

  return (
    <section
      data-theme="light"
      className="bg-background text-foreground relative isolate overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Visual layer — paper-white composition with gold and graphite ornaments, no photography */}
      <m.div className="absolute inset-0 -z-10" style={reduce ? undefined : { y: imgY }}>
        <div aria-hidden className="hero-mesh absolute inset-0" />
        {/* Drifting warm-grey and gold blooms */}
        <div
          aria-hidden
          className="hero-blob top-[-10%] right-[-5%] h-[55vw] max-h-[720px] w-[55vw] max-w-[720px] opacity-70"
          style={{
            background: "radial-gradient(closest-side, rgba(255,255,255,0.95), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="hero-blob bottom-[-20%] left-[-10%] h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] opacity-70 [animation-delay:-7s]"
          style={{
            background: "radial-gradient(closest-side, rgba(245,197,24,0.3), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="hero-blob top-[35%] left-[30%] h-[36vw] max-h-[480px] w-[36vw] max-w-[480px] opacity-50 [animation-delay:-11s]"
          style={{
            background: "radial-gradient(closest-side, rgba(255,255,255,0.9), transparent 70%)",
          }}
        />
        {/* Orbit ornament behind the capability panel */}
        <HeroOrbits className="absolute top-1/2 right-[-14%] hidden w-[58vw] max-w-[980px] -translate-y-[46%] opacity-70 lg:block" />
        <NetworkLines className="absolute inset-0 h-full w-full opacity-[0.28]" />
        <div aria-hidden className="grid-lines absolute inset-0 text-black opacity-30" />
        {/* Gold diagonal hairline — the logo's circuit trace, abstracted */}
        <div
          aria-hidden
          className="from-gold-500/0 via-gold-500/70 to-gold-500/0 absolute top-0 right-[38%] hidden h-[140%] w-px origin-top rotate-[22deg] bg-gradient-to-b lg:block"
        />
      </m.div>

      {/* Content */}
      <m.div className="container-x relative grid grid-cols-1 items-center gap-x-10 gap-y-12 pt-32 pb-14 lg:grid-cols-12 lg:pt-40 lg:pb-16">
        {/* Copy */}
        <div className="lg:col-span-7">
          <m.p
            {...fade(0.25)}
            className="border-gold-500/60 bg-gold-500/15 text-foreground font-label inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.14em] uppercase"
          >
            <span className="relative flex size-1.5">
              <span className="animate-pulse-soft bg-gold-400 absolute inset-0 rounded-full" />
              <span className="bg-gold-500 relative size-1.5 rounded-full" />
            </span>
            {hero.badge}
          </m.p>

          <TextReveal
            as="h1"
            delay={0.4}
            className="text-h1 text-foreground mt-7 font-bold"
            lines={hero.titleLines.map((line, i) => (
              <span key={i}>
                <GoldHighlight text={line} highlight={hero.highlight} />
              </span>
            ))}
          />
          <div id="hero-title" className="sr-only">
            {hero.titleLines.join(" ")}
          </div>

          <m.p {...fade(0.9)} className="text-lead text-muted-foreground mt-6 max-w-[50ch]">
            {hero.lead}
          </m.p>

          <m.div
            {...fade(1.05)}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <MagneticButton>
              <Button href={hero.primaryCta.href} size="lg">
                {hero.primaryCta.label}
              </Button>
            </MagneticButton>
            <Button href={hero.secondaryCta.href} size="lg" variant="secondary" arrow="up">
              {hero.secondaryCta.label}
            </Button>
          </m.div>

          {/* Trust row */}
          <m.div {...fade(1.3)} className="border-border mt-10 border-t pt-5">
            <p className="text-muted-foreground font-label text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
              Trusted by
            </p>
            <ul className="mt-4 flex flex-wrap items-center gap-3">
              {customers.items
                .filter((c) => Boolean(c.logo && c.url))
                .slice(0, 5)
                .map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${c.name} — official website`}
                      aria-label={`${c.name} — visit official website (opens in a new tab)`}
                      className="client-chip focus-visible:ring-gold-400 border-border block rounded-md border bg-white px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <Image
                        src={c.logo}
                        alt={c.name}
                        width={120}
                        height={40}
                        priority
                        className="h-7 w-auto"
                      />
                    </a>
                  </li>
                ))}
            </ul>
          </m.div>
        </div>

        {/* Capability panel */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease: EASE_OUT_EXPO }}
          style={reduce ? undefined : { y: panelY }}
          className="lg:col-span-5"
        >
          <HeroPanel />
        </m.div>

        {/* Technical data points */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-muted-foreground border-border font-label flex flex-wrap items-center gap-x-10 gap-y-3 border-t pt-6 text-[0.7rem] font-semibold tracking-[0.14em] uppercase lg:col-span-12"
        >
          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            {hero.dataPoints.map((d) => (
              <div key={d.label} className="flex gap-3">
                <dt className="text-muted-foreground">{d.label}</dt>
                <dd className="text-foreground">{d.value}</dd>
              </div>
            ))}
          </dl>
          <div className="ml-auto hidden items-center gap-2 md:flex" aria-hidden>
            <ArrowDown
              className="size-3.5 animate-bounce [animation-duration:2.2s]"
              strokeWidth={1.5}
            />
            <span>Scroll</span>
          </div>
        </m.div>
      </m.div>
    </section>
  );
}
