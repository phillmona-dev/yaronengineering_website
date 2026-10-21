"use client";

import { SimpleCrud } from "@/components/admin/SimpleCrud";

export default function CategoriesPage() {
  return (
    <SimpleCrud
      resource="categories"
      title="Categories"
      description="Editorial sections of the Knowledge Hub. Order controls the category navigation."
      fields={[
        { name: "name", label: "Name", required: true, fromTitle: true },
        {
          name: "slug",
          label: "Slug",
          hint: "Lowercase, hyphenated. Generated from the name when empty.",
        },
        { name: "tagline", label: "Tagline", hint: "One line shown under the category title." },
        { name: "description", label: "Description", type: "textarea" },
        { name: "sortOrder", label: "Sort order", type: "number" },
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
          key: "tagline",
          label: "Tagline",
          render: (r) => <span className="text-ink-500">{String(r.tagline ?? "")}</span>,
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
