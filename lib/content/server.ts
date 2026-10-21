import { DEFAULT_CONTENT } from "./defaults";
import type { SiteContent } from "./types";

/**
 * Returns the site content built from the hand-written data files in `lib/data/`.
 * In static-export / cPanel mode there is no backend API, so the defaults are always used.
 * Pages can call this at build time without needing a running server.
 */
export async function getSiteContent(): Promise<SiteContent> {
  return DEFAULT_CONTENT;
}

/** Kept for compatibility — no longer used in static-export mode. */
export const SITE_CONTENT_TAG = "site-content";

