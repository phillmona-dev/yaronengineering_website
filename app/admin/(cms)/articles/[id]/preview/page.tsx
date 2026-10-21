import { ArticlePreviewClient } from "@/components/admin/ArticlePreviewClient";

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "draft" }];
}

export const dynamicParams = false;

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArticlePreviewClient id={id} />;
}
