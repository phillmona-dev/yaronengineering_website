import type {
  ArticleDetail,
  ArticleSummary,
  Author,
  Category,
  Page,
  SitemapData,
  Tag,
} from "./types";

export class BlogApiUnavailable extends Error {}

const STATIC_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Data Centers",
    slug: "data-centers",
    tagline: "High-density facility architecture, Tier-3 uptime, power & cooling.",
    description: "Engineering approaches to mission-critical facilities in emerging markets.",
    articleCount: 1,
    sortOrder: 1,
  },
  {
    id: "cat-2",
    name: "ICT Infrastructure",
    slug: "ict-infrastructure",
    tagline: "Enterprise networking, structured cabling, VoIP & storage.",
    description: "Modernizing core network foundations for high throughput and zero packet loss.",
    articleCount: 1,
    sortOrder: 2,
  },
  {
    id: "cat-3",
    name: "Cybersecurity",
    slug: "cybersecurity",
    tagline: "Zero-Trust defense, next-gen firewalls & threat mitigation.",
    description: "Hardening financial, government, and enterprise systems against advanced threats.",
    articleCount: 1,
    sortOrder: 3,
  },
  {
    id: "cat-4",
    name: "Cloud & Systems",
    slug: "cloud-systems",
    tagline: "Hybrid virtualization, server clustering & enterprise backup.",
    description: "Scalable compute platforms and disaster recovery architectures.",
    articleCount: 0,
    sortOrder: 4,
  },
];

const STATIC_TAGS: Tag[] = [
  { id: "tag-1", name: "Tier-3", slug: "tier-3", articleCount: 1 },
  { id: "tag-2", name: "Facility", slug: "facility", articleCount: 1 },
  { id: "tag-3", name: "VoIP", slug: "voip", articleCount: 1 },
  { id: "tag-4", name: "Networking", slug: "networking", articleCount: 1 },
  { id: "tag-5", name: "Zero-Trust", slug: "zero-trust", articleCount: 1 },
  { id: "tag-6", name: "Security", slug: "security", articleCount: 1 },
];

const STATIC_AUTHOR: Author = {
  id: "auth-1",
  name: "Yaron Engineering PLC Team",
  slug: "yaron-team",
  position: "Infrastructure & Systems Engineering",
  bio: "Specialists in enterprise ICT infrastructure, data center facilities, cybersecurity, and cloud integration across Ethiopia and East Africa.",
  articleCount: 3,
};

const STATIC_ARTICLES: ArticleDetail[] = [
  {
    id: "1",
    slug: "designing-high-availability-data-centers-ethiopia",
    title: "Designing High-Availability Data Centers in East Africa",
    excerpt: "Best practices and engineering strategies for deploying Tier-3 redundant power and precision cooling infrastructures in growing markets.",
    contentHtml: `
      <p class="lead">Modern enterprise data centers require strict compliance with uptime standards. At Yaron Engineering, our team designs dual-path electrical feeds, precision cooling loops, and intelligent power distribution architectures tailored for high-density server environments.</p>
      
      <h2>1. Dual-Path Electrical Architecture</h2>
      <p>Uninterruptible power requires isolation from grid fluctuations. By deploying dual-bus STS (Static Transfer Switches) and independent generator sets with automatic transfer controls, Tier-3 requirements of 99.982% availability are achieved.</p>
      
      <h2>2. Precision Cooling & Hot-Aisle Containment</h2>
      <p>Cooling is critical to operational stability. In hot and arid regional climates, modular chilled-water loops paired with intelligent airflow management prevent thermal hot spots while minimizing PUE (Power Usage Effectiveness).</p>
      
      <h2>3. Environmental & Fire Suppression Standards</h2>
      <p>Clean-agent fire extinguishing systems (FM-200 / Novec 1230) and VESDA (Very Early Smoke Detection Apparatus) provide multi-stage protection for sensitive IT equipment without residue or equipment damage.</p>
    `,
    contentJson: null,
    coverImage: {
      id: "med-1",
      url: "/images/photos/hero-datacenter.jpg",
      altText: "High Availability Data Center",
      width: 1200,
      height: 800,
      mimeType: "image/jpeg",
    },
    category: STATIC_CATEGORIES[0],
    tags: [STATIC_TAGS[0], STATIC_TAGS[1]],
    author: STATIC_AUTHOR,
    status: "PUBLISHED",
    featured: true,
    readingTimeMinutes: 5,
    viewCount: 1420,
    publishedAt: "2024-03-15T09:00:00Z",
    scheduledAt: null,
    createdAt: "2024-03-10T08:00:00Z",
    updatedAt: "2024-03-15T09:00:00Z",
    toc: [
      { id: "dual-path-electrical-architecture", text: "Dual-Path Electrical Architecture", level: 2 },
      { id: "precision-cooling-hot-aisle-containment", text: "Precision Cooling & Hot-Aisle Containment", level: 2 },
      { id: "environmental-fire-suppression-standards", text: "Environmental & Fire Suppression Standards", level: 2 },
    ],
    seo: {
      title: "Designing High-Availability Data Centers in East Africa",
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
    contentHtml: `
      <p class="lead">Unified communications allow seamless collaboration between headquarters and branch offices. Through enterprise VoIP gateways and QoS network prioritization, call latency drops to imperceptible levels while reducing telecommunication costs by up to 40%.</p>
      
      <h2>1. Legacy PABX vs Enterprise VoIP</h2>
      <p>Traditional copper-line PBX systems present severe scalability limitations. Transitioning to IP-PBX enables softphone integration, mobile extension routing, and automated interactive voice response (IVR) without costly hardware additions.</p>
      
      <h2>2. Quality of Service (QoS) Optimization</h2>
      <p>Voice traffic cannot tolerate jitter or packet loss. Implementing DiffServ QoS labeling (DSCP EF 46) at core switch boundaries ensures crystal-clear voice clarity even during peak data transfer intervals.</p>
    `,
    contentJson: null,
    coverImage: {
      id: "med-2",
      url: "/images/photos/network-patch.jpg",
      altText: "Enterprise Networking",
      width: 1200,
      height: 800,
      mimeType: "image/jpeg",
    },
    category: STATIC_CATEGORIES[1],
    tags: [STATIC_TAGS[2], STATIC_TAGS[3]],
    author: STATIC_AUTHOR,
    status: "PUBLISHED",
    featured: false,
    readingTimeMinutes: 4,
    viewCount: 890,
    publishedAt: "2024-04-02T10:30:00Z",
    scheduledAt: null,
    createdAt: "2024-03-28T11:00:00Z",
    updatedAt: "2024-04-02T10:30:00Z",
    toc: [
      { id: "legacy-pabx-vs-enterprise-voip", text: "Legacy PABX vs Enterprise VoIP", level: 2 },
      { id: "quality-of-service-qos-optimization", text: "Quality of Service (QoS) Optimization", level: 2 },
    ],
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
    contentHtml: `
      <p class="lead">Financial infrastructure requires multi-layered defense. Combining next-generation firewalls, encrypted SD-WAN, and 24/7 SIEM monitoring ensures that unauthorized lateral movement within the perimeter is identified and neutralized in seconds.</p>
      
      <h2>1. Micro-Segmentation & Identity Enforcement</h2>
      <p>By enforcing continuous authentication and strict subnet segregation, compromised endpoints cannot bridge into payment gateways or core core banking databases.</p>
      
      <h2>2. Proactive Threat Intelligence & SIEM</h2>
      <p>Consolidating audit logs across network appliances and domain controllers gives security teams complete visibility into anomalies before data exfiltration can occur.</p>
    `,
    contentJson: null,
    coverImage: {
      id: "med-3",
      url: "/images/photos/circuit-glow.jpg",
      altText: "Cybersecurity Shield",
      width: 1200,
      height: 800,
      mimeType: "image/jpeg",
    },
    category: STATIC_CATEGORIES[2],
    tags: [STATIC_TAGS[4], STATIC_TAGS[5]],
    author: STATIC_AUTHOR,
    status: "PUBLISHED",
    featured: false,
    readingTimeMinutes: 6,
    viewCount: 650,
    publishedAt: "2024-05-01T14:00:00Z",
    scheduledAt: null,
    createdAt: "2024-05-01T14:00:00Z",
    updatedAt: "2024-05-01T14:00:00Z",
    toc: [
      { id: "micro-segmentation-identity-enforcement", text: "Micro-Segmentation & Identity Enforcement", level: 2 },
      { id: "proactive-threat-intelligence-siem", text: "Proactive Threat Intelligence & SIEM", level: 2 },
    ],
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

// Populate related
STATIC_ARTICLES[0].related = [STATIC_ARTICLES[1], STATIC_ARTICLES[2]];
STATIC_ARTICLES[1].related = [STATIC_ARTICLES[0], STATIC_ARTICLES[2]];
STATIC_ARTICLES[2].related = [STATIC_ARTICLES[0], STATIC_ARTICLES[1]];

export type ListParams = {
  page?: number;
  size?: number;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  sort?: "newest" | "popular";
};

export const blogApi = {
  async listArticles(params: ListParams = {}): Promise<Page<ArticleSummary>> {
    let items = STATIC_ARTICLES.filter((a) => a.status === "PUBLISHED");
    if (params.category) items = items.filter((a) => a.category?.slug === params.category);
    if (params.tag) items = items.filter((a) => a.tags.some((t) => t.slug === params.tag));
    if (params.author) items = items.filter((a) => a.author?.slug === params.author);
    if (params.sort === "popular") items = [...items].sort((a, b) => b.viewCount - a.viewCount);

    const size = params.size ?? 12;
    const pageIndex = params.page ?? 0;
    const start = pageIndex * size;
    const paged = items.slice(start, start + size);

    return {
      content: paged,
      page: pageIndex,
      size,
      totalElements: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / size)),
      last: start + size >= items.length,
    };
  },

  async featured(limit = 1): Promise<ArticleSummary[]> {
    return STATIC_ARTICLES.filter((a) => a.featured && a.status === "PUBLISHED").slice(0, limit);
  },

  async article(slug: string): Promise<ArticleDetail | null> {
    return STATIC_ARTICLES.find((a) => a.slug === slug) ?? null;
  },

  async related(slug: string, limit = 3): Promise<ArticleSummary[]> {
    return STATIC_ARTICLES.filter((a) => a.slug !== slug && a.status === "PUBLISHED").slice(0, limit);
  },

  async search(q: string, page = 0, size = 12): Promise<Page<ArticleSummary> | null> {
    if (!q || q.trim().length < 2) {
      return { content: [], page: 0, size, totalElements: 0, totalPages: 0, last: true };
    }
    const query = q.toLowerCase().trim();
    const matches = STATIC_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.excerpt.toLowerCase().includes(query) ||
        a.category?.name.toLowerCase().includes(query) ||
        a.tags.some((t) => t.name.toLowerCase().includes(query)),
    );
    const start = page * size;
    return {
      content: matches.slice(start, start + size),
      page,
      size,
      totalElements: matches.length,
      totalPages: Math.max(1, Math.ceil(matches.length / size)),
      last: start + size >= matches.length,
    };
  },

  async categories(): Promise<Category[]> {
    return STATIC_CATEGORIES;
  },

  async category(slug: string): Promise<Category | null> {
    return STATIC_CATEGORIES.find((c) => c.slug === slug) ?? null;
  },

  async tags(): Promise<Tag[]> {
    return STATIC_TAGS;
  },

  async tag(slug: string): Promise<Tag | null> {
    return STATIC_TAGS.find((t) => t.slug === slug) ?? null;
  },

  async authors(): Promise<Author[]> {
    return [STATIC_AUTHOR];
  },

  async author(slug: string): Promise<Author | null> {
    return slug === STATIC_AUTHOR.slug ? STATIC_AUTHOR : null;
  },

  async sitemap(): Promise<SitemapData | null> {
    return null;
  },
};
