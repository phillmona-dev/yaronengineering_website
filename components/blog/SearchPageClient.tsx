"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { blogApi } from "@/lib/blog/api";
import type { ArticleSummary, Category, Page } from "@/lib/blog/types";
import { Section } from "@/components/ui/Section";
import { BlogMasthead } from "@/components/blog/BlogMasthead";
import { CategoryNav } from "@/components/blog/CategoryNav";
import { ArticleRow } from "@/components/blog/ArticleRow";
import { EmptyState } from "@/components/blog/BlogStates";
import { Pagination } from "@/components/blog/Pagination";

export function SearchPageClient() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const query = q.trim().slice(0, 120);
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Page<ArticleSummary> | null>(null);

  useEffect(() => {
    blogApi.categories().then(setCategories);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      blogApi.search(query, 0, 10).then(setResults);
    } else {
      setResults(null);
    }
  }, [query]);

  const hrefFor = (p: number) =>
    `/blog/search?q=${encodeURIComponent(query)}${p ? `&page=${p}` : ""}`;

  return (
    <>
      <BlogMasthead
        eyebrow="Search"
        crumbs={[{ label: "Search", href: "/blog/search" }]}
        title={
          query
            ? [
                <span key="a">Results for</span>,
                <span key="b" className="text-brand-300">
                  &ldquo;{query}&rdquo;
                </span>,
              ]
            : [<span key="a">Search the</span>, <span key="b">Knowledge Hub.</span>]
        }
        lead={
          query && results
            ? `${results.totalElements} article${results.totalElements === 1 ? "" : "s"} match your search.`
            : "Find articles by topic, technology, category, tag or author."
        }
        search
      />
      <Section theme="light" className="pt-8 md:pt-10 xl:pt-12">
        <div className="container-x">
          <CategoryNav categories={categories} />
          <div className="mt-10">
            {!query || query.length < 2 ? (
              <EmptyState
                title="Type at least two characters."
                text="Try topics such as firewall, data center cooling, Azure, or structured cabling."
              />
            ) : results === null || results.content.length === 0 ? (
              <EmptyState
                title={`No results for “${query}”.`}
                text="Check the spelling, try a broader term, or browse by category above."
                action={{ label: "All insights", href: "/blog" }}
              />
            ) : (
              <>
                <div className="border-border border-b">
                  {results.content.map((a, i) => (
                    <ArticleRow key={a.id} article={a} index={i} />
                  ))}
                </div>
                <Pagination page={0} totalPages={results.totalPages} hrefFor={hrefFor} />
              </>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
