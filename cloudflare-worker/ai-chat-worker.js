/**
 * Yaron Engineering — AI Chat Cloudflare Worker
 * ================================================
 * Deploy this file to Cloudflare Workers to serve as a secure proxy
 * between the static website and the Google Gemini API.
 *
 * SETUP STEPS:
 * 1. Create a free Cloudflare account at https://cloudflare.com
 * 2. Go to Workers & Pages → Create Application → Create Worker
 * 3. Paste the contents of this file into the online editor
 * 4. Click "Save and Deploy"
 * 5. Go to Worker Settings → Variables → Add Secret:
 *      Name:  GEMINI_API_KEY
 *      Value: your Google Gemini API key (from https://aistudio.google.com/app/apikey)
 * 6. Copy the deployed Worker URL (e.g. https://yaron-ai.YOUR_SUBDOMAIN.workers.dev)
 * 7. Before building the site, set in .env.local:
 *      NEXT_PUBLIC_AI_WORKER_URL=https://yaron-ai.YOUR_SUBDOMAIN.workers.dev/chat
 *
 * CORS: The worker already allows requests from yaronengineering.com.
 *       Update ALLOWED_ORIGIN below if your domain changes.
 */

const ALLOWED_ORIGIN = "https://yaronengineering.com";

// Try Gemini models in order — fall back if one is overloaded (429/503)
const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `You are an AI assistant embedded on the Yaron Engineering website.
You answer questions about Yaron Engineering in a friendly, professional, and confident way.
Keep answers concise (2-4 sentences max), engaging, and use emojis very sparingly.
If asked something you do not know or that falls outside what is documented below, say:
"I don't have that detail on hand — please reach out to our team at info@yaronengineering.com or call +251-11-XXX-XXXX and they'll be happy to help."
Never guess, never fabricate facts. Never quote contract values, prices or project costs.

── ABOUT YARON ENGINEERING ──────────────────────────────────────────
Full name: Yaron Engineering PLC
Tagline: Engineering the infrastructure behind a secure digital future.
Headquarters: Addis Ababa, Ethiopia

Yaron Engineering PLC is an ICT infrastructure and system integration company based in Addis Ababa, Ethiopia.
The company specialises in delivering enterprise-grade ICT solutions across East Africa.

── SERVICES ──────────────────────────────────────────────────────────────
1. ICT Infrastructure — Design, supply, and deployment of enterprise network and communication infrastructure.
2. Data Center Facility — End-to-end data center design, construction, and management.
3. ICT Consultancy — Strategic advisory, architecture planning, and technology roadmaps.
4. Cybersecurity — Risk assessment, security design, SOC setup, and compliance.
5. Cloud Services — Cloud migration, hybrid cloud, and managed cloud services.
6. Servers & Storage — Enterprise server and storage solutions (HPE, Dell, Cisco).
7. Physical & Electronic Security — CCTV, access control, and physical security systems.

── CONTACT DETAILS ───────────────────────────────────────────────────
Email: info@yaronengineering.com
Website pages: Home (/), About (/about), Services (/services), Solutions (/solutions),
Careers (/careers), Contact (/contact)
`;

async function callGemini(apiKey, model, messages) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(`${BASE_URL}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 350 },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { ok: false, error: err.error?.message ?? "Gemini API error.", status: res.status };
  }

  const data = await res.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "I couldn't fetch a response right now. Please try again!";
  return { ok: true, text };
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    const origin = request.headers.get("Origin") ?? "";
    const isAllowed = origin === ALLOWED_ORIGIN || origin.endsWith(".yaronengineering.com");
    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed." }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let lastError = "All AI models are currently unavailable. Please try again shortly.";
    for (const model of GEMINI_MODELS) {
      const result = await callGemini(apiKey, model, messages);
      if (result.ok && result.text) {
        return new Response(JSON.stringify({ reply: result.text }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const retryable = result.status === 503 || result.status === 429;
      lastError = result.error ?? lastError;
      if (!retryable) break;
    }

    return new Response(JSON.stringify({ error: lastError }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
