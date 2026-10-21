import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Yaron CMS", template: "%s · Yaron CMS" },
  robots: { index: false, follow: false },
};

/** Admin routes render without the corporate header/footer; see app/admin/(cms)/layout.tsx. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
