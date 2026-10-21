import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { SITE_URL } from "@/lib/utils/site";
import { company } from "@/lib/data/company";

export const metadata: Metadata = {
  title: { default: "Insights", template: `%s | Insights | ${company.name}` },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "@id": `${SITE_URL}/blog#blog`,
          name: `${company.shortName} Insights`,
          url: `${SITE_URL}/blog`,
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      {children}
    </>
  );
}
