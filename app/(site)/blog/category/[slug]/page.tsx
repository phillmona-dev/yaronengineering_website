import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogApi } from "@/lib/blog/api";
import { pageMetadata, breadcrumbSchema } from "@/lib/utils/seo";
import { JsonLd } from "@/components/layout/JsonLd";
import { Section } from "@/components/ui/Section";
import { BlogMasthead } from "@/components/blog/BlogMasthead";
import { CategoryNav } from "@/components/blog/CategoryNav";
import { FeaturedArticle } from "@/components/blog/FeaturedArticle";
import { ArticleRow } from "@/components/blog/ArticleRow";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { EmptyState } from "@/components/blog/BlogStates";
import { Pagination } from "@/components/blog/Pagination";
import { NewsletterCTA } from "@/components/blog/NewsletterCTA";

type Params = { slug: string };

export function generateStaticParams() {
  return [
    { slug: "data-centers" },
    { slug: "ict-infrastructure" },
    { slug: "cybersecurity" },
    { slug: "cloud-systems" },
  ];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await blogApi.category(slug);
  if (!c) return { title: "Category not found" };
  return pageMetadata({
    title: `${c.name} · Insights`,
    description: c.tagline || c.description || `Articles on ${c.name} from Yaron Engineering.`,
    path: `/blog/category/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = 0;
  const [category, categories, list, popular] = await Promise.all([
    blogApi.category(slug),
    blogApi.categories(),
    blogApi.listArticles({ category: slug, page, size: 9 }),
    blogApi.listArticles({ category: slug, size: 3, sort: "popular" }),
  ]);
  if (!category) notFound();

  const featured = page === 0 ? list.content[0] : undefined;
  const rows = featured ? list.content.slice(1) : list.content;
  const related = category.related?.length
    ? category.related
    : categories.filter((c) => c.slug !== slug).slice(0, 5);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Insights", path: "/blog" },
          { name: category.name, path: `/blog/category/${slug}` },
        ])}
      />
      <BlogMasthead
        eyebrow={`Category · ${list.totalElements} article${list.totalElements === 1 ? "" : "s"}`}
        crumbs={[{ label: category.name, href: `/blog/category/${slug}` }]}
        title={[<span key="a">{category.name}</span>]}
        lead={category.tagline || category.description}
      />
      <Section theme="light" className="pt-10 md:pt-12 xl:pt-14">
        <div className="container-x">
          <CategoryNav categories={categories} active={slug} />
          {list.totalElements === 0 ? (
            <EmptyState
              className="mt-14"
              title={`No ${category.name.toLowerCase()} articles yet.`}
              text="This category is ready; the first insights are being written."
              action={{ label: "Back to all insights", href: "/blog" }}
            />
          ) : (
            <>
              {featured && (
                <div className="mt-14 lg:mt-20">
                  <FeaturedArticle article={featured} eyebrow={`Featured in ${category.name}`} />
                </div>
              )}
              {rows.length > 0 && (
                <div className="mt-20 lg:mt-24">
                  <p className="eyebrow">
                    <span aria-hidden className="bg-gold-500 h-px w-6" />
                    Latest in {category.name}
                  </p>
                  <div className="border-border mt-8 border-b">
                    {rows.map((a, i) => (
                      <ArticleRow key={a.id} article={a} index={i} />
                    ))}
                  </div>
                </div>
              )}
              <Pagination
                page={page}
                totalPages={list.totalPages}
                hrefFor={(p) =>
                  p === 0 ? `/blog/category/${slug}` : `/blog/category/${slug}?page=${p}`
                }
              />
              {popular.content.length > 1 && (
                <div className="mt-24">
                  <p className="eyebrow">
                    <span aria-hidden className="bg-gold-500 h-px w-6" />
                    Popular in {category.name}
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
          {related.length > 0 && (
            <div className="border-border mt-24 border-t pt-10">
              <p className="eyebrow">
                <span aria-hidden className="bg-gold-500 h-px w-6" />
                Related categories
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {related.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/blog/category/${c.slug}`}
                      className="border-border text-muted-foreground hover:border-foreground hover:text-foreground text-body inline-flex h-9 items-center rounded-sm border px-3.5 transition-colors"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-24">
            <NewsletterCTA />
          </div>
        </div>
      </Section>
    </>
  );
}
