import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogApi } from "@/lib/blog/api";
import { absoluteUrl, SITE_URL } from "@/lib/utils/site";
import { mediaUrl } from "@/lib/blog/format";
import { company } from "@/lib/data/company";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema } from "@/lib/utils/seo";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import { CoverImage } from "@/components/blog/CoverImage";
import { Byline } from "@/components/blog/ArticleMeta";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareRail } from "@/components/blog/ShareRail";
import { AuthorCard, AuthorAvatar } from "@/components/blog/AuthorCard";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { NewsletterCTA } from "@/components/blog/NewsletterCTA";
import { ViewTracker } from "@/components/blog/ViewTracker";
import { formatDate } from "@/lib/blog/format";

type Params = { slug: string };

export function generateStaticParams() {
  return [
    { slug: "designing-high-availability-data-centers-ethiopia" },
    { slug: "modernizing-enterprise-ip-telephony" },
    { slug: "next-gen-cybersecurity-defense-banking" },
  ];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await blogApi.article(slug);
  if (!a) return { title: "Article not found" };
  const title = a.seo.title || a.title;
  const description = a.seo.description || a.excerpt;
  const url = absoluteUrl(`/blog/${a.slug}`);
  const image = a.seo.ogImage?.url || a.coverImage?.url;
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : absoluteUrl(mediaUrl(image))
    : undefined;
  return {
    title,
    description,
    alternates: { canonical: a.seo.canonicalUrl || url },
    robots: a.seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: company.name,
      publishedTime: a.publishedAt ?? undefined,
      modifiedTime: a.updatedAt,
      authors: a.author ? [absoluteUrl(`/blog/author/${a.author.slug}`)] : undefined,
      section: a.category?.name,
      tags: a.tags.map((t) => t.name),
      images: imageUrl ? [{ url: imageUrl, alt: a.coverImage?.altText ?? title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await blogApi.article(slug);
  if (!article) notFound();

  const author = article.author ? await blogApi.author(article.author.slug) : null;
  const url = absoluteUrl(`/blog/${article.slug}`);
  const cover = article.coverImage?.url
    ? article.coverImage.url.startsWith("http")
      ? article.coverImage.url
      : absoluteUrl(mediaUrl(article.coverImage.url))
    : undefined;

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${url}#article`,
            mainEntityOfPage: url,
            headline: article.title,
            description: article.excerpt,
            image: cover ? [cover] : undefined,
            datePublished: article.publishedAt ?? undefined,
            dateModified: article.updatedAt,
            author: article.author
              ? {
                  "@type": "Person",
                  name: article.author.name,
                  jobTitle: article.author.position ?? undefined,
                  url: absoluteUrl(`/blog/author/${article.author.slug}`),
                }
              : { "@type": "Organization", name: company.name },
            publisher: { "@id": `${SITE_URL}/#organization` },
            articleSection: article.category?.name,
            keywords: article.tags.map((t) => t.name).join(", ") || undefined,
            wordCount: undefined,
            isPartOf: { "@id": `${SITE_URL}/blog#blog` },
          },
          breadcrumbSchema([
            { name: "Insights", path: "/blog" },
            ...(article.category
              ? [{ name: article.category.name, path: `/blog/category/${article.category.slug}` }]
              : []),
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
        ]}
      />
      <ReadingProgress />
      <ViewTracker slug={article.slug} />

      {/* Header */}
      <header data-theme="light" className="bg-background text-foreground pt-32 lg:pt-44">
        <div className="container-x">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <ol className="text-muted-foreground font-label flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Insights
                  </Link>
                </li>
                {article.category && (
                  <li className="flex items-center gap-2">
                    <span aria-hidden>/</span>
                    <Link
                      href={`/blog/category/${article.category.slug}`}
                      className="text-brand-text hover:text-foreground"
                    >
                      {article.category.name}
                    </Link>
                  </li>
                )}
              </ol>
            </nav>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-7 max-w-[20ch] text-[clamp(2.25rem,1.4rem+3.2vw,3.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
              {article.title}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-body text-muted-foreground mt-6 max-w-[62ch]">{article.excerpt}</p>
          </Reveal>
          <Reveal
            delay={0.22}
            className="border-border mt-8 flex flex-col gap-6 border-t pt-6 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-4">
              {article.author && <AuthorAvatar author={article.author} size={44} />}
              <div>
                <Byline article={article} />
                <p className="text-muted-foreground font-label mt-1 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                  {article.publishedAt && (
                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  )}
                  {article.updatedAt &&
                    article.publishedAt &&
                    new Date(article.updatedAt).getTime() -
                      new Date(article.publishedAt).getTime() >
                      86400000 && (
                      <>
                        {" "}
                        · Updated{" "}
                        <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
                      </>
                    )}
                  <> · {Math.max(1, article.readingTimeMinutes)} min read</>
                </p>
              </div>
            </div>
            <ShareRail
              url={url}
              title={article.title}
              orientation="horizontal"
              className="xl:hidden"
            />
          </Reveal>
        </div>
      </header>

      {/* Cover */}
      <div data-theme="light" className="bg-background pt-10 lg:pt-14">
        <div className="container-x">
          <Reveal delay={0.1}>
            <CoverImage
              media={article.coverImage}
              sizes="(min-width: 1440px) 1376px, 100vw"
              priority
              className="aspect-[21/9] rounded-md"
            />
            {article.coverImage?.altText && (
              <p className="text-muted-foreground text-body mt-3">{article.coverImage.altText}</p>
            )}
          </Reveal>
        </div>
      </div>

      {/* Body */}
      <Section theme="light" drop={false} className="pt-12 md:pt-16 xl:pt-20">
        <div className="container-x">
          <div className="grid gap-10 xl:grid-cols-[180px_minmax(0,740px)_1fr] xl:gap-14">
            <aside className="hidden xl:block">
              <div className="sticky top-32">
                <ShareRail url={url} title={article.title} orientation="vertical" />
              </div>
            </aside>
            <div className="min-w-0">
              {article.toc.length > 2 && (
                <div className="mb-10 xl:hidden">
                  <TableOfContents items={article.toc} variant="inline" />
                </div>
              )}
              <ArticleRenderer html={article.contentHtml} />
              {article.tags.length > 0 && (
                <ul
                  className="border-border mt-14 flex flex-wrap gap-2 border-t pt-8"
                  aria-label="Tags"
                >
                  {article.tags.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/blog/tag/${t.slug}`}
                        className="border-border text-muted-foreground hover:border-foreground hover:text-foreground font-label inline-flex h-8 items-center rounded-sm border px-3 text-[0.7rem] font-semibold tracking-[0.14em] uppercase transition-colors"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {author && (
                <div className="mt-12">
                  <AuthorCard author={author} />
                </div>
              )}
            </div>
            <aside className="hidden xl:block">
              {article.toc.length > 1 && (
                <div className="sticky top-32">
                  <TableOfContents items={article.toc} />
                </div>
              )}
            </aside>
          </div>

          {article.related.length > 0 && (
            <div className="border-border mt-24 border-t pt-16 lg:mt-32">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="eyebrow">
                    <span aria-hidden className="bg-gold-500 h-px w-6" />
                    Continue reading
                  </p>
                  <h2 className="text-h2 mt-4 font-semibold">Related insights</h2>
                </div>
                <Link
                  href="/blog"
                  className="text-brand-text text-body hidden font-medium md:block"
                >
                  All insights
                </Link>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {article.related.slice(0, 3).map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-24 lg:mt-32">
            <NewsletterCTA />
          </div>
        </div>
      </Section>
    </>
  );
}
