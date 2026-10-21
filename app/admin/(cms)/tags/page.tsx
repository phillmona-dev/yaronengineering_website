"use client";

import { SimpleCrud } from "@/components/admin/SimpleCrud";

export default function TagsPage() {
  return (
    <SimpleCrud
      resource="tags"
      title="Tags"
      description="Fine-grained topics attached to articles."
      fields={[
        { name: "name", label: "Name", required: true, fromTitle: true },
        { name: "slug", label: "Slug" },
      ]}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (r) => <span className="font-medium">{r.name}</span>,
        },
        {
          key: "slug",
          label: "Slug",
          render: (r) => <span className="text-ink-500 font-mono text-xs">{r.slug}</span>,
        },
        {
          key: "articleCount",
          label: "Articles",
          render: (r) => <span className="tabular-nums">{r.articleCount ?? 0}</span>,
        },
      ]}
    />
  );
}
