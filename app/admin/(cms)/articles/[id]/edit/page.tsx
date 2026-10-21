import { ArticleEditorLoader } from "@/components/admin/ArticleEditorLoader";

export const metadata = { title: "Edit article" };

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "draft" }];
}

export const dynamicParams = false;

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArticleEditorLoader id={id} />;
}
