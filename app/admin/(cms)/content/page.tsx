import type { Metadata } from "next";
import { ContentIndex } from "@/components/admin/content/ContentIndex";

export const metadata: Metadata = { title: "Website content" };

export default function ContentPage() {
  return <ContentIndex />;
}
