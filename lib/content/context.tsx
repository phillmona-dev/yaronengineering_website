"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CONTENT } from "./defaults";
import type { SiteContent } from "./types";

const SiteContentContext = createContext<SiteContent>(DEFAULT_CONTENT);

/** Makes the merged site content available to client components (header, hero, menus…). */
export function SiteContentProvider({
  content: initialContent,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<SiteContent>(initialContent);

  useEffect(() => {
    // If running in browser, check if admin updated content.json on cPanel
    fetch(`/admin/content.json?_t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === "object") {
          setContent((prev) => ({
            ...prev,
            ...data,
            company: { ...prev.company, ...(data.company || {}) },
            about: { ...prev.about, ...(data.about || {}) },
            home: { ...prev.home, ...(data.home || {}) },
            pages: { ...prev.pages, ...(data.pages || {}) },
            navigation: { ...prev.navigation, ...(data.navigation || {}) },
            services: { ...prev.services, ...(data.services || {}) },
            solutions: { ...prev.solutions, ...(data.solutions || {}) },
            industries: { ...prev.industries, ...(data.industries || {}) },
            projects: { ...prev.projects, ...(data.projects || {}) },
            customers: { ...prev.customers, ...(data.customers || {}) },
            partners: { ...prev.partners, ...(data.partners || {}) },
            why: { ...prev.why, ...(data.why || {}) },
            careers: { ...prev.careers, ...(data.careers || {}) },
          }));
        }
      })
      .catch(() => {
        // Silently retain pre-rendered content if offline or fetch fails
      });
  }, []);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext);
}
