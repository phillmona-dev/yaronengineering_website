import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogApi } from "@/lib/blog/api";
import { pageMetadata } from "@/lib/utils/seo";
import { absoluteUrl } from "@/lib/utils/site";
import { JsonLd } from "@/components/layout/JsonLd";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import { GridLines } from "@/components/ui/Backdrop";
import { AuthorAvatar } from "@/components/blog/AuthorCard";
import { LinkedInIcon } from "@/components/blog/SocialIcons";
import { ArticleRow } from "@/components/blog/ArticleRow";
import { EmptyState } from "@/components/blog/BlogStates";
import { Pagination } from "@/components/blog/Pagination";
import Link from "next/link";

type Params = { slug: string };

export function generateStaticParams() {
  return [{ slug: "yaron-team" }];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await blogApi.author(slug);
  if (!a) return { title: "Author not found" };
  return pageMetadata({
    title: `${a.name} · Insights`,
    description:
      a.bio || `Articles by ${a.name}${a.position ? `, ${a.position}` : ""} at Yaron Engineering.`,
    path: `/blog/author/${slug}`,
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = 0;
  const [author, list] = await Promise.all([
    blogApi.author(slug),
    blogApi.listArticles({ author: slug, page, size: 10 }),
  ]);
  if (!author) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: author.name,
          jobTitle: author.position ?? undefined,
          description: author.bio ?? undefined,
          url: absoluteUrl(`/blog/author/${slug}`),
          sameAs: author.linkedinUrl ? [author.linkedinUrl] : undefined,
          worksFor: { "@type": "Organization", name: "Yaron Engineering PLC" },
        }}
      />
      <section
        data-theme="dark"
        className="bg-ink-950 text-foreground relative overflow-hidden pt-32 pb-14 lg:pt-40 lg:pb-16"
      >
        <GridLines className="text-white opacity-50" />
        <div className="container-x relative">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="text-ink-400 font-label flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Insights
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  <span className="text-ink-200">Author</span>
                </li>
              </ol>
            </nav>
          </Reveal>
          <Reveal delay={0.05} className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <AuthorAvatar author={author} size={96} className="border-border shrink-0 border" />
            <div>
              <h1 className="text-h1 font-semibold text-white">{author.name}</h1>
              {author.position && <p className="text-lead text-ink-300 mt-2">{author.position}</p>}
              <p className="text-ink-400 font-label mt-4 flex flex-wrap items-center gap-5 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                <span>
                  {list.totalElements} article{list.totalElements === 1 ? "" : "s"}
                </span>
                {author.linkedinUrl && (
                  <a
                    href={author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <LinkedInIcon className="size-3.5" /> LinkedIn
                  </a>
                )}
              </p>
            </div>
          </Reveal>
          {author.bio && (
            <Reveal delay={0.15}>
              <p className="text-body text-ink-200 mt-8 max-w-[64ch]">{author.bio}</p>
            </Reveal>
          )}
        </div>
      </section>
      <Section theme="light" className="pt-6 md:pt-8 xl:pt-10">
        <div className="container-x">
          {list.content.length === 0 ? (
            <EmptyState
              title="No published articles yet."
              text="This author's first insights are in progress."
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
            hrefFor={(p) => (p === 0 ? `/blog/author/${slug}` : `/blog/author/${slug}?page=${p}`)}
          />
        </div>
      </Section>
    </>
  );
}
