"use client";

import type { ApiError, Page, DashboardStats, ArticleSummary, ArticleDetail, ContactMessage, SiteContentDoc, Category, Tag } from "@/lib/blog/types";
import { DEFAULT_CONTENT } from "@/lib/content/defaults";

export class AdminApiError extends Error {
  status: number;
  code: string;
  errors?: { field: string; message: string }[];
  constructor(status: number, body: Partial<ApiError>) {
    super(body.message ?? `Request failed (${status})`);
    this.status = status;
    this.code = body.code ?? "ERROR";
    this.errors = body.errors;
  }
}

// Default simulated articles
const SEED_ARTICLES: ArticleDetail[] = [
  {
    id: "1",
    slug: "designing-high-availability-data-centers-ethiopia",
    title: "Designing High-Availability Data Centers in East Africa",
    excerpt: "Best practices and engineering strategies for deploying Tier-3 redundant power and cooling infrastructures in growing markets.",
    contentHtml: "<p>Modern enterprise data centers require strict compliance with uptime standards. At Yaron Engineering, our team designs dual-path electrical feeds, precision cooling loops, and intelligent power distribution architectures tailored for high-density server environments.</p><p>Integrating real-time thermal monitoring and automatic generator failovers ensures 99.982% availability across all operations.</p>",
    contentJson: null,
    coverImage: {
      id: "med-1",
      url: "/images/photos/hero-datacenter.jpg",
      altText: "High Availability Data Center",
      width: 1200,
      height: 800,
      mimeType: "image/jpeg",
    },
    category: { id: "cat-1", name: "Data Centers", slug: "data-centers" },
    tags: [
      { id: "tag-1", name: "Tier-3", slug: "tier-3" },
      { id: "tag-2", name: "Facility", slug: "facility" },
    ],
    author: { id: "auth-1", name: "Yaron Engineering PLC Team", slug: "yaron-team" },
    status: "PUBLISHED",
    featured: true,
    readingTimeMinutes: 5,
    viewCount: 1420,
    publishedAt: "2024-03-15T09:00:00Z",
    scheduledAt: null,
    createdAt: "2024-03-10T08:00:00Z",
    updatedAt: "2024-03-15T09:00:00Z",
    toc: [
      { id: "power", text: "Dual-Path Electrical Feeds", level: 2 },
      { id: "cooling", text: "Precision Cooling Systems", level: 2 },
    ],
    seo: {
      title: "Designing High-Availability Data Centers",
      description: "Engineering strategies for deploying Tier-3 redundant data centers.",
      canonicalUrl: null,
      ogImage: null,
      noIndex: false,
    },
    related: [],
  },
  {
    id: "2",
    slug: "modernizing-enterprise-ip-telephony",
    title: "Modernizing Enterprise IP Telephony & Unified Communications",
    excerpt: "Transitioning legacy PABX systems to secure cloud-managed SIP trunking and VoIP communication platforms.",
    contentHtml: "<p>Unified communications allow seamless collaboration between headquarters and branch offices. Through enterprise VoIP gateways and QoS network prioritization, call latency drops to imperceptible levels while reducing telecommunication costs by up to 40%.</p>",
    contentJson: null,
    coverImage: {
      id: "med-2",
      url: "/images/photos/network-patch.jpg",
      altText: "Enterprise Networking",
      width: 1200,
      height: 800,
      mimeType: "image/jpeg",
    },
    category: { id: "cat-2", name: "ICT Infrastructure", slug: "ict-infrastructure" },
    tags: [
      { id: "tag-3", name: "VoIP", slug: "voip" },
      { id: "tag-4", name: "Networking", slug: "networking" },
    ],
    author: { id: "auth-1", name: "Yaron Engineering PLC Team", slug: "yaron-team" },
    status: "PUBLISHED",
    featured: false,
    readingTimeMinutes: 4,
    viewCount: 890,
    publishedAt: "2024-04-02T10:30:00Z",
    scheduledAt: null,
    createdAt: "2024-03-28T11:00:00Z",
    updatedAt: "2024-04-02T10:30:00Z",
    toc: [{ id: "sip", text: "SIP Trunking Migration", level: 2 }],
    seo: {
      title: "Enterprise IP Telephony Modernization",
      description: "Transitioning legacy PABX to cloud-managed VoIP.",
      canonicalUrl: null,
      ogImage: null,
      noIndex: false,
    },
    related: [],
  },
  {
    id: "3",
    slug: "next-gen-cybersecurity-defense-banking",
    title: "Next-Generation Cybersecurity Defense for Financial Institutions",
    excerpt: "Implementing Zero-Trust network architecture and automated threat intelligence for critical banking networks.",
    contentHtml: "<p>Financial infrastructure requires multi-layered defense. Combining next-generation firewalls, encrypted SD-WAN, and 24/7 SIEM monitoring ensures that unauthorized lateral movement within the perimeter is identified and neutralized in seconds.</p>",
    contentJson: null,
    coverImage: {
      id: "med-3",
      url: "/images/photos/circuit-glow.jpg",
      altText: "Cybersecurity Shield",
      width: 1200,
      height: 800,
      mimeType: "image/jpeg",
    },
    category: { id: "cat-3", name: "Cybersecurity", slug: "cybersecurity" },
    tags: [
      { id: "tag-5", name: "Zero-Trust", slug: "zero-trust" },
      { id: "tag-6", name: "Security", slug: "security" },
    ],
    author: { id: "auth-1", name: "Yaron Engineering PLC Team", slug: "yaron-team" },
    status: "DRAFT",
    featured: false,
    readingTimeMinutes: 6,
    viewCount: 0,
    publishedAt: null,
    scheduledAt: null,
    createdAt: "2024-05-01T14:00:00Z",
    updatedAt: "2024-05-01T14:00:00Z",
    toc: [{ id: "zerotrust", text: "Zero-Trust Architecture", level: 2 }],
    seo: {
      title: "Next-Gen Cybersecurity Defense",
      description: "Implementing Zero-Trust network architecture for banking.",
      canonicalUrl: null,
      ogImage: null,
      noIndex: false,
    },
    related: [],
  },
];

const SEED_MESSAGES: ContactMessage[] = [
  {
    id: "msg-1",
    name: "Dawit Haile",
    email: "dawit@financialcorp.et",
    organization: "East Africa Finance",
    subject: "Technical consultation for Tier-3 data center cooling upgrade",
    message: "We are planning to upgrade our primary data center facility with N+1 precision cooling and modular UPS systems. Please send technical consultation availability.",
    status: "NEW",
    notes: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    readAt: null,
    repliedAt: null,
  },
  {
    id: "msg-2",
    name: "Selamawit Tadesse",
    email: "selam@telecomsolutions.com",
    organization: "Global Telecom PLC",
    subject: "Quotation request for branch fiber optic cabling",
    message: "Requesting a quotation for outdoor fiber optic cabling and enterprise edge router configurations for 5 branch locations in Addis Ababa.",
    status: "READ",
    notes: "Followed up via phone; quotation sent.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    readAt: new Date(Date.now() - 86400000).toISOString(),
    repliedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SEED_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Data Centers", slug: "data-centers", tagline: "Tier-3 facility design, precision cooling, power infrastructure", articleCount: 1, sortOrder: 1 },
  { id: "cat-2", name: "ICT Infrastructure", slug: "ict-infrastructure", tagline: "Enterprise networking, servers, storage, VoIP telephony", articleCount: 1, sortOrder: 2 },
  { id: "cat-3", name: "Cybersecurity", slug: "cybersecurity", tagline: "Next-gen firewalls, Zero Trust, network defense & SIEM", articleCount: 1, sortOrder: 3 },
  { id: "cat-4", name: "Cloud & Systems", slug: "cloud-systems", tagline: "Hybrid cloud migration, virtualization, enterprise storage", articleCount: 0, sortOrder: 4 },
];

const SEED_TAGS: Tag[] = [
  { id: "tag-1", name: "Tier-3", slug: "tier-3", articleCount: 1 },
  { id: "tag-2", name: "Facility", slug: "facility", articleCount: 1 },
  { id: "tag-3", name: "VoIP", slug: "voip", articleCount: 1 },
  { id: "tag-4", name: "Networking", slug: "networking", articleCount: 1 },
  { id: "tag-5", name: "Zero-Trust", slug: "zero-trust", articleCount: 1 },
  { id: "tag-6", name: "Security", slug: "security", articleCount: 1 },
];

function getStored<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

function setStored<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

async function simulatedHandler<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const cleanPath = path.replace(/^\//, "").split("?")[0];

  // Auth check
  if (cleanPath === "auth/me") {
    return {
      id: "1",
      email: "admin@yaronengineering.com",
      name: "Yaron Admin",
      role: "ADMIN",
      createdAt: "2024-01-01T00:00:00Z",
    } as T;
  }

  // Dashboard stats
  if (cleanPath === "dashboard/stats") {
    const articles = getStored<ArticleDetail[]>("yaron_articles", SEED_ARTICLES);
    const messages = getStored<ContactMessage[]>("yaron_messages", SEED_MESSAGES);
    const published = articles.filter((a) => a.status === "PUBLISHED");
    const drafts = articles.filter((a) => a.status === "DRAFT");
    const scheduled = articles.filter((a) => a.status === "SCHEDULED");
    const archived = articles.filter((a) => a.status === "ARCHIVED");
    const unread = messages.filter((m) => m.status === "NEW").length;
    const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);

    const now = Date.now();
    const viewsLast30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(now - (29 - i) * 86400000);
      return {
        date: d.toISOString().split("T")[0],
        views: Math.floor(45 + Math.sin(i / 3) * 25 + (i * 2)),
      };
    });

    const stats: DashboardStats = {
      totalArticles: articles.length,
      published: published.length,
      drafts: drafts.length,
      scheduled: scheduled.length,
      archived: archived.length,
      totalViews,
      viewsLast30Days,
      mostRead: [...published].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
      recent: [...articles].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
      recentActivity: [
        {
          at: new Date(now - 1000 * 60 * 15).toISOString(),
          actor: "Admin",
          action: "UPDATED",
          articleTitle: articles[0]?.title ?? "Data Center Design",
          articleId: articles[0]?.id ?? "1",
        },
        {
          at: new Date(now - 1000 * 60 * 120).toISOString(),
          actor: "Admin",
          action: "PUBLISHED",
          articleTitle: articles[1]?.title ?? "Enterprise IP Telephony",
          articleId: articles[1]?.id ?? "2",
        },
      ],
      unreadMessages: unread,
      recentMessages: messages.slice(0, 5),
    };
    return stats as T;
  }

  // Contact messages summary
  if (cleanPath === "contact-messages/summary") {
    const messages = getStored<ContactMessage[]>("yaron_messages", SEED_MESSAGES);
    const unread = messages.filter((m) => m.status === "NEW").length;
    const replied = messages.filter((m) => m.status === "REPLIED").length;
    const archived = messages.filter((m) => m.status === "ARCHIVED").length;
    const oneDayAgo = Date.now() - 86400000;
    const last24h = messages.filter((m) => new Date(m.createdAt).getTime() >= oneDayAgo).length;
    return {
      total: messages.length,
      unread,
      replied,
      archived,
      last24h,
    } as T;
  }

  // Contact messages list
  if (cleanPath === "contact-messages") {
    const messages = getStored<ContactMessage[]>("yaron_messages", SEED_MESSAGES);
    const page: Page<ContactMessage> = {
      content: messages,
      page: 0,
      size: 25,
      totalElements: messages.length,
      totalPages: 1,
      last: true,
    };
    return page as T;
  }

  // Contact messages actions (read, unread, replied, archive, notes, delete)
  if (cleanPath.startsWith("contact-messages/")) {
    const parts = cleanPath.split("/");
    const id = parts[1];
    const action = parts[2];
    let messages = getStored<ContactMessage[]>("yaron_messages", SEED_MESSAGES);

    if (method === "DELETE") {
      messages = messages.filter((m) => m.id !== id);
      setStored("yaron_messages", messages);
      return undefined as T;
    }

    if (method === "PUT" && action === "notes") {
      const notesVal = body && typeof body === "object" && "notes" in body ? String((body as { notes: string }).notes) : "";
      messages = messages.map((m) => (m.id === id ? { ...m, notes: notesVal, updatedAt: new Date().toISOString() } : m));
      setStored("yaron_messages", messages);
      return (messages.find((m) => m.id === id) || messages[0]) as T;
    }

    if (action) {
      const statusMap: Record<string, "NEW" | "READ" | "REPLIED" | "ARCHIVED"> = {
        read: "READ",
        unread: "NEW",
        replied: "REPLIED",
        archive: "ARCHIVED",
      };
      const newStatus = statusMap[action] || "READ";
      messages = messages.map((m) => (m.id === id ? { ...m, status: newStatus, updatedAt: new Date().toISOString() } : m));
      setStored("yaron_messages", messages);
      return (messages.find((m) => m.id === id) || messages[0]) as T;
    }
  }

  // Articles list
  if (cleanPath === "articles") {
    const articles = getStored<ArticleDetail[]>("yaron_articles", SEED_ARTICLES);
    const page: Page<ArticleSummary> = {
      content: articles,
      page: 0,
      size: 20,
      totalElements: articles.length,
      totalPages: 1,
      last: true,
    };
    return page as T;
  }

  // Single article get
  if (cleanPath.startsWith("articles/") && !cleanPath.includes("/publish") && !cleanPath.includes("/archive")) {
    const id = cleanPath.split("/")[1];
    const articles = getStored<ArticleDetail[]>("yaron_articles", SEED_ARTICLES);
    const art = articles.find((a) => a.id === id);
    if (art) return art as T;
    return articles[0] as T;
  }

  // Article actions
  if (cleanPath.includes("/publish") || cleanPath.includes("/unpublish") || cleanPath.includes("/archive")) {
    const parts = cleanPath.split("/");
    const id = parts[1];
    const action = parts[2];
    const articles = getStored<ArticleDetail[]>("yaron_articles", SEED_ARTICLES);
    const updated = articles.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: action === "publish" ? ("PUBLISHED" as const) : action === "archive" ? ("ARCHIVED" as const) : ("DRAFT" as const),
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });
    setStored("yaron_articles", updated);
    return updated.find((a) => a.id === id) as T;
  }

  // Categories
  if (cleanPath === "categories") {
    return getStored<Category[]>("yaron_categories", SEED_CATEGORIES) as T;
  }

  // Tags
  if (cleanPath === "tags") {
    return getStored<Tag[]>("yaron_tags", SEED_TAGS) as T;
  }

  // Authors
  if (cleanPath === "authors") {
    return [
      {
        id: "auth-1",
        name: "Yaron Engineering PLC Team",
        slug: "yaron-team",
        position: "Infrastructure & Systems Engineering",
        bio: "Specialists in enterprise ICT infrastructure, data center facilities, cybersecurity, and cloud integration.",
        articleCount: 3,
      },
    ] as T;
  }

  // Media
  if (cleanPath === "media") {
    return {
      content: [
        {
          id: "med-1",
          url: "/images/photos/hero-datacenter.jpg",
          altText: "Data Center Facility",
          width: 1200,
          height: 800,
          mimeType: "image/jpeg",
        },
        {
          id: "med-2",
          url: "/images/photos/network-patch.jpg",
          altText: "Network Patch Panel",
          width: 1200,
          height: 800,
          mimeType: "image/jpeg",
        },
        {
          id: "med-3",
          url: "/images/photos/circuit-glow.jpg",
          altText: "Secure Cloud Circuit",
          width: 1200,
          height: 800,
          mimeType: "image/jpeg",
        },
      ],
      page: 0,
      size: 20,
      totalElements: 3,
      totalPages: 1,
      last: true,
    } as T;
  }

  // Site content overview
  if (cleanPath === "site-content") {
    let siteContentData: Record<string, unknown> = DEFAULT_CONTENT as unknown as Record<string, unknown>;
    try {
      const res = await fetch("/admin/content.json");
      if (res.ok) siteContentData = await res.json();
    } catch {}

    const docs: SiteContentDoc[] = Object.keys(siteContentData).map((sec) => ({
      section: sec,
      data: siteContentData[sec] as Record<string, unknown>,
      updatedAt: new Date().toISOString(),
      updatedBy: "Admin",
    }));
    return docs as T;
  }

  // Site content by section
  if (cleanPath.startsWith("site-content/")) {
    const sec = cleanPath.split("/")[1];
    let siteContentData: Record<string, unknown> = DEFAULT_CONTENT as unknown as Record<string, unknown>;
    try {
      const res = await fetch("/admin/content.json");
      if (res.ok) siteContentData = await res.json();
    } catch {}

    const sectionData = (siteContentData[sec] || (DEFAULT_CONTENT as Record<string, unknown>)[sec] || {}) as Record<string, unknown>;

    if (method === "PUT" && body) {
      // Save override
      if (typeof window !== "undefined") {
        try {
          const overrides = JSON.parse(localStorage.getItem("yaron_content_overrides") || "{}");
          overrides[sec] = body;
          localStorage.setItem("yaron_content_overrides", JSON.stringify(overrides));
        } catch {}
      }
      return {
        section: sec,
        data: body as Record<string, unknown>,
        updatedAt: new Date().toISOString(),
        updatedBy: "Admin",
      } as T;
    }

    return {
      section: sec,
      data: sectionData,
      updatedAt: new Date().toISOString(),
      updatedBy: "Admin",
    } as T;
  }

  return {} as T;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();

  try {
    const res = await fetch(`/api/admin/${path.replace(/^\//, "")}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });

    if (res.ok) {
      if (res.status === 204) return undefined as T;
      const text = await res.text();
      return text ? (JSON.parse(text) as T) : ({} as T);
    }
  } catch {
    // Network / server unavailable — proceed to simulated client handler
  }

  // Fallback to client-side simulated data store
  let bodyData: unknown = undefined;
  if (init.body && typeof init.body === "string") {
    try {
      bodyData = JSON.parse(init.body);
    } catch {}
  }
  return simulatedHandler<T>(path, method, bodyData);
}

export const admin = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};

export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type { Page };
