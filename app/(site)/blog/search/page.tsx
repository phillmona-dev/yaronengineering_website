import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchPageClient } from "@/components/blog/SearchPageClient";
import { pageMetadata } from "@/lib/utils/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Search Insights",
    description: "Search Yaron Engineering insights by topic, technology or keyword.",
    path: "/blog/search",
  }),
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
      <SearchPageClient />
    </Suspense>
  );
}
