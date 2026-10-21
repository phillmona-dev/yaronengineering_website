"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { admin } from "@/lib/admin/client";
import type { ArticleDetail } from "@/lib/blog/types";
import { ArticlePreview } from "@/components/blog/ArticlePreview";

export function ArticlePreviewClient({ id }: { id: string }) {
  const [article, setArticle] = useState<ArticleDetail | null>(null);

  useEffect(() => {
    admin
      .get<ArticleDetail>(`articles/${id}`)
      .then(setArticle)
      .catch(() => undefined);
  }, [id]);

  if (!article) {
    return (
      <div className="flex h-64 items-center justify-center text-ink-400">
        <p>Loading preview…</p>
      </div>
    );
  }

  return (
    <div className="-m-4 md:-m-6 lg:-m-8">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gold-500/40 bg-gold-500/15 px-4 py-2 text-sm text-gold-700">
        <span>
          <strong>Preview</strong> · {article.status} · This is how the article will appear once
          published.
        </span>
        <Link
          href={`/admin/articles/${article.id}/edit`}
          className="font-medium underline underline-offset-2"
        >
          Back to editor
        </Link>
      </div>
      <ArticlePreview article={article} />
    </div>
  );
}
