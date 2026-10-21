"use client";

import { m } from "framer-motion";

/** Subtle fade on blog route changes. */
export default function BlogTemplate({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
