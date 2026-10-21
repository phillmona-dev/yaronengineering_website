"use client";

import { SimpleCrud } from "@/components/admin/SimpleCrud";

export default function AuthorsPage() {
  return (
    <SimpleCrud
      resource="authors"
      title="Authors"
      description="Real Yaron Engineering staff only. Avatars can be attached from the Media library by ID."
      fields={[
        { name: "name", label: "Name", required: true, fromTitle: true },
        { name: "slug", label: "Slug" },
        { name: "position", label: "Position" },
        { name: "bio", label: "Biography", type: "textarea" },
        { name: "linkedinUrl", label: "LinkedIn URL", type: "url" },
        {
          name: "avatarId",
          label: "Avatar media ID",
          hint: "Paste the ID of an uploaded image from Media.",
        },
      ]}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (r) => <span className="font-medium">{r.name}</span>,
        },
        {
          key: "position",
          label: "Position",
          render: (r) => <span className="text-ink-500">{String(r.position ?? "")}</span>,
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
