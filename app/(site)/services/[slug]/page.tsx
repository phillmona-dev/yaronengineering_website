import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/hero/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/animations/Stagger";
import { ClipReveal } from "@/components/animations/ClipReveal";
import { ParallaxImage } from "@/components/animations/ParallaxImage";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/layout/JsonLd";
import { DEFAULT_CONTENT } from "@/lib/content/defaults";
import { getSiteContent } from "@/lib/content/server";
import { serviceIcon } from "@/lib/content/icons";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/utils/seo";

type Params = { slug: string };

/** Built-in services are prerendered; no dynamic params in static-export mode. */
export function generateStaticParams(): Params[] {
  return DEFAULT_CONTENT.services.items.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;


export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { services } = await getSiteContent();
  const service = services.items.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${slug}`,
  });
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { services: servicesContent } = await getSiteContent();
  const services = servicesContent.items;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();
  const Icon = serviceIcon(service.icon);

  const idx = services.findIndex((s) => s.slug === slug);
  const next = services[(idx + 1) % services.length];
  const [first, ...restTitle] = service.title.split(" ");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${slug}` },
          ]),
          serviceSchema(service.title, service.summary, `/services/${slug}`),
        ]}
      />
      <PageHero
        eyebrow={`Service ${service.index} · ${service.theme}`}
        crumbs={[
          { label: "Services", href: "/services" },
          { label: service.shortTitle, href: `/services/${slug}` },
        ]}
        title={[<span key="a">{first}</span>, <span key="b">{restTitle.join(" ")}</span>]}
        lead={service.summary}
      />

      <Section theme="light" aria-labelledby="overview-title">
        <div className="container-x grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow>Overview</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 id="overview-title" className="text-h2 mt-6 font-semibold">
                {service.shortTitle}, engineered as a{" "}
                <span className="text-brand-text">system.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16} className="mt-10">
              <Icon className="text-brand size-8" strokeWidth={1.25} aria-hidden />
            </Reveal>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-7 lg:col-start-6">
            {service.description.map((p, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p className={i === 0 ? "text-body" : "text-body text-muted-foreground"}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="container-x mt-20 grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <Eyebrow>Capabilities</Eyebrow>
            </Reveal>
            <StaggerGroup as="ul" className="border-border-strong mt-6 border-t" stagger={0.06}>
              {service.capabilities.map((c, i) => (
                <StaggerItem
                  as="li"
                  key={c}
                  className="border-border flex items-center gap-5 border-b py-5"
                >
                  <span className="text-muted-foreground font-label text-[0.7rem] font-semibold tracking-[0.14em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-h4 font-semibold">{c}</span>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal>
              <Eyebrow>What you get</Eyebrow>
            </Reveal>
            <StaggerGroup as="ul" className="mt-6 flex flex-col gap-4" stagger={0.06}>
              {service.outcomes.map((o) => (
                <StaggerItem
                  as="li"
                  key={o}
                  className="border-border bg-surface text-body flex items-start gap-3 rounded-md border p-5"
                >
                  <span aria-hidden className="bg-brand mt-2 size-1.5 shrink-0 rounded-full" />
                  {o}
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </Section>

      <Section theme="dark" aria-label="Service visual">
        <div className="container-x grid grid-cols-1 items-end gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ClipReveal className="border-border aspect-[16/9] overflow-hidden rounded-md border">
              <ParallaxImage
                src={service.image.src}
                alt={service.image.alt}
                sizes="(min-width: 1024px) 66vw, 100vw"
                containerClassName="h-full w-full"
                strength={0.06}
                duotone
              />
            </ClipReveal>
          </div>
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow">Next service</p>
              <Link
                href={`/services/${next.slug}`}
                className="group border-border text-h4 mt-4 flex items-center justify-between gap-4 border-t pt-5 font-semibold text-white"
              >
                <span>
                  <span className="text-ink-400 font-label mr-3 text-[0.7rem] font-semibold tracking-[0.14em]">
                    {next.index}
                  </span>
                  {next.title}
                </span>
                <ArrowRight
                  className="text-brand-300 size-5 shrink-0 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              <Button href="/contact" size="lg">
                Discuss {service.shortTitle.toLowerCase()}
              </Button>
            </Reveal>
          </div>
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
