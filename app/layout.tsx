import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/animations/MotionProvider";
import { JsonLd } from "@/components/layout/JsonLd";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, organizationSchema } from "@/lib/utils/seo";
import { SITE_URL } from "@/lib/utils/site";
import { company } from "@/lib/data/company";
import AiChat from "@/components/ai/AiChat";

/* Display + label face: geometric, confident, distinctly "tech". */
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["500", "600", "700"],
});

/* Body + UI face: open, friendly and highly legible at small sizes. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${company.name}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: company.name,
  keywords: [
    "ICT infrastructure Ethiopia",
    "cybersecurity Addis Ababa",
    "data center design Ethiopia",
    "system integrator East Africa",
    "cloud services Ethiopia",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: company.name,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },

};

export const viewport: Viewport = {
  themeColor: "#1540a6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jakarta.variable} ${geistMono.variable}`}
      data-theme="light"
    >
      <body>
        <MotionProvider>{children}</MotionProvider>
        <AiChat />
        <JsonLd data={organizationSchema()} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: company.name,
            publisher: { "@id": `${SITE_URL}/#organization` },
          }}
        />
      </body>
    </html>
  );
}
