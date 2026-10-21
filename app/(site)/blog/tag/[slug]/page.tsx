import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogApi } from "@/lib/blog/api";
import { pageMetadata } from "@/lib/utils/seo";
import { Section } from "@/components/ui/Section";
import { BlogMasthead } from "@/components/blog/BlogMasthead";
import { ArticleRow } from "@/components/blog/ArticleRow";
import { EmptyState } from "@/components/blog/BlogStates";
import { Pagination } from "@/components/blog/Pagination";

type Params = { slug: string };

export function generateStaticParams() {
  return [
    { slug: "tier-3" },
    { slug: "facility" },
    { slug: "voip" },
    { slug: "networking" },
    { slug: "zero-trust" },
    { slug: "security" },
  ];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await blogApi.tag(slug);
  if (!t) return { title: "Tag not found" };
  return pageMetadata({
    title: `#${t.name} · Insights`,
    description: `Articles tagged ${t.name} from Yaron Engineering.`,
    path: `/blog/tag/${slug}`,
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = 0;
  const [tag, list] = await Promise.all([
    blogApi.tag(slug),
    blogApi.listArticles({ tag: slug, page, size: 10 }),
  ]);
  if (!tag) notFound();
  return (
    <>
      <BlogMasthead
        eyebrow={`Tag · ${list.totalElements} article${list.totalElements === 1 ? "" : "s"}`}
        crumbs={[{ label: tag.name, href: `/blog/tag/${slug}` }]}
        title={[<span key="a">#{tag.name}</span>]}
      />
      <Section theme="light" className="pt-6 md:pt-8 xl:pt-10">
        <div className="container-x">
          {list.content.length === 0 ? (
            <EmptyState
              title="No articles with this tag yet."
              text="Try another topic or browse all insights."
              action={{ label: "All insights", href: "/blog" }}
            />
          ) : (
            <div className="border-border border-b">
              {list.content.map((a, i) => (
                <ArticleRow key={a.id} article={a} index={page * 10 + i} />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            totalPages={list.totalPages}
            hrefFor={(p) => (p === 0 ? `/blog/tag/${slug}` : `/blog/tag/${slug}?page=${p}`)}
          />
        </div>
      </Section>
    </>
  );
}
