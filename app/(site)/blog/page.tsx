import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogApi } from "@/lib/blog/api";
import { pageMetadata } from "@/lib/utils/seo";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { GridLines, Glow } from "@/components/ui/Backdrop";
import { FeaturedArticle } from "@/components/blog/FeaturedArticle";
import { ArticleRow } from "@/components/blog/ArticleRow";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CategoryNav } from "@/components/blog/CategoryNav";
import { SearchForm } from "@/components/blog/SearchForm";
import { NewsletterCTA } from "@/components/blog/NewsletterCTA";
import { EmptyState, UnavailableState } from "@/components/blog/BlogStates";
import { Pagination } from "@/components/blog/Pagination";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = pageMetadata({
  title: "Insights",
  description:
    "Perspectives from Yaron Engineering on ICT infrastructure, cybersecurity, cloud, data centers, enterprise technology and digital transformation in Ethiopia and East Africa.",
  path: "/blog",
});

export default async function BlogPage() {
  const [featured, categories, latest, popular] = await Promise.all([
    blogApi.featured(1),
    blogApi.categories(),
    blogApi.listArticles({ page: 0, size: 8, sort: "newest" }),
    blogApi.listArticles({ size: 3, sort: "popular" }),
  ]);

  const hero = featured[0] ?? null;
  const rows = latest.content.filter((a) => a.slug !== hero?.slug);
  const unavailable = !hero && latest.totalElements === 0 && categories.length === 0;

  return (
    <>
      {/* Masthead */}
      <section
        data-theme="dark"
        className="bg-ink-950 text-foreground relative overflow-hidden pt-32 pb-16 lg:pt-44 lg:pb-20"
      >
        <GridLines className="text-white opacity-50" />
        <Glow className="-top-20 -right-40 h-[480px] w-[480px] opacity-50" />
        <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="eyebrow text-ink-300">
                <span aria-hidden className="bg-gold-500 h-px w-6" />
                Yaron Engineering · Insights
              </p>
            </Reveal>
            <TextReveal
              as="h1"
              delay={0.15}
              className="text-h1 mt-6 max-w-[16ch] font-bold text-white"
              lines={[
                <span key="a">Engineering insights</span>,
                <span key="b">
                  for a <span className="text-gold-400">digital</span> world.
                </span>,
              ]}
            />
            <Reveal delay={0.4}>
              <p className="text-lead text-ink-300 mt-7 max-w-[56ch]">
                Perspectives from Yaron Engineering on infrastructure, cybersecurity, cloud,
                enterprise technology and digital transformation.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.45} className="lg:col-span-4">
            <SearchForm size="md" />
            <p className="text-ink-400 font-label mt-3 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
              Search articles, topics and technologies
            </p>
          </Reveal>
        </div>
      </section>

      <Section theme="light" className="pt-10 md:pt-12 xl:pt-14">
        <div className="container-x">
          <Reveal>
            <CategoryNav categories={categories} />
          </Reveal>

          {unavailable ? (
            <UnavailableState className="mt-14" />
          ) : (
            <>
              {hero && (
                <div className="mt-14 lg:mt-20">
                  <FeaturedArticle article={hero} />
                </div>
              )}

              <div className="mt-20 flex items-end justify-between gap-6 lg:mt-28">
                <div>
                  <p className="eyebrow">
                    <span aria-hidden className="bg-gold-500 h-px w-6" />
                    Latest insights
                  </p>
                  <h2 className="text-h2 mt-4 font-semibold">
                    Recent thinking from our engineers.
                  </h2>
                </div>
                <Link
                  href="/blog/search"
                  className="text-brand-text text-body hidden items-center gap-2 font-medium md:inline-flex"
                >
                  Browse all topics <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>

              {rows.length === 0 ? (
                <EmptyState
                  className="mt-10"
                  title="No articles published yet."
                  text="New insights are on the way. Subscribe below to be the first to read them."
                />
              ) : (
                <div className="border-border mt-10 border-b">
                  {rows.map((a, i) => (
                    <ArticleRow key={a.id} article={a} index={i} />
                  ))}
                </div>
              )}
              <Pagination
                page={0}
                totalPages={latest.totalPages}
                hrefFor={(p) => (p === 0 ? "/blog" : `/blog?page=${p}`)}
              />

              {popular && popular.content.length > 1 && (
                <div className="mt-24 lg:mt-32">
                  <p className="eyebrow">
                    <span aria-hidden className="bg-gold-500 h-px w-6" />
                    Most read
                  </p>
                  <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {popular.content.map((a) => (
                      <ArticleCard key={a.id} article={a} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-24 lg:mt-32">
            <NewsletterCTA />
          </div>
        </div>
      </Section>

      <FinalCTA
        title={["Have a question", "for our engineers?"]}
        text="Tell us what you're building, protecting or transforming."
        primary={{ label: "Start a Conversation", href: "/contact" }}
        secondary={{ label: "Explore Services", href: "/services" }}
      />
    </>
  );
}
