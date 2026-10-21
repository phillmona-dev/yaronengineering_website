import { DEFAULT_CONTENT } from "./defaults";
import type { SiteContent } from "./types";

import fs from "fs";
import path from "path";

/**
 * Returns the site content built from the hand-written data files in `lib/data/`
 * merged with any overrides from `public/admin/content.json`.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const jsonPath = path.join(process.cwd(), "public", "admin", "content.json");
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CONTENT,
        ...parsed,
        company: { ...DEFAULT_CONTENT.company, ...(parsed.company || {}) },
        about: { ...DEFAULT_CONTENT.about, ...(parsed.about || {}) },
        home: { ...DEFAULT_CONTENT.home, ...(parsed.home || {}) },
        pages: { ...DEFAULT_CONTENT.pages, ...(parsed.pages || {}) },
        navigation: { ...DEFAULT_CONTENT.navigation, ...(parsed.navigation || {}) },
        services: { ...DEFAULT_CONTENT.services, ...(parsed.services || {}) },
        solutions: { ...DEFAULT_CONTENT.solutions, ...(parsed.solutions || {}) },
        industries: { ...DEFAULT_CONTENT.industries, ...(parsed.industries || {}) },
        projects: { ...DEFAULT_CONTENT.projects, ...(parsed.projects || {}) },
        customers: { ...DEFAULT_CONTENT.customers, ...(parsed.customers || {}) },
        partners: { ...DEFAULT_CONTENT.partners, ...(parsed.partners || {}) },
        why: { ...DEFAULT_CONTENT.why, ...(parsed.why || {}) },
        careers: { ...DEFAULT_CONTENT.careers, ...(parsed.careers || {}) },
      };
    }
  } catch (err) {
    console.warn("Could not read public/admin/content.json, using defaults:", err);
  }
  return DEFAULT_CONTENT;
}

/** Kept for compatibility — no longer used in static-export mode. */
export const SITE_CONTENT_TAG = "site-content";

