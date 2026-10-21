const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DIR = path.join(__dirname, "out");

// Read GEMINI_API_KEY from environment or .env.local
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY && fs.existsSync(path.join(__dirname, ".env.local"))) {
  const envContent = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("GEMINI_API_KEY=")) {
      GEMINI_API_KEY = trimmed.substring("GEMINI_API_KEY=".length).trim();
      break;
    }
  }
}
if (!GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment or .env.local");
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const SYSTEM_PROMPT = `You are an AI assistant embedded on the Yaron Engineering website.
You answer questions about Yaron Engineering PLC in a friendly, professional, and confident way.
Keep answers concise (2-4 sentences max), engaging, and use emojis very sparingly.
If asked something you do not know, say:
"I don't have that detail on hand — please reach out to our team at info@yaronengineering.com or call +251-11-XXX-XXXX and they'll be happy to help."
Never guess, never fabricate facts. Never quote contract values, prices or project costs.

── ABOUT YARON ENGINEERING ──
Full name: Yaron Engineering PLC
Tagline: Engineering the infrastructure behind a secure digital future.
Headquarters: Addis Ababa, Ethiopia
Specialization: Enterprise ICT solutions, system integration, cybersecurity, data center facility, cloud services, and servers & storage.

── SERVICES ──
1. ICT Infrastructure — Design, supply, and deployment of enterprise network and communication infrastructure.
2. Data Center Facility — End-to-end data center design, construction, and management.
3. ICT Consultancy — Strategic advisory, architecture planning, and technology roadmaps.
4. Cybersecurity — Risk assessment, security design, SOC setup, and compliance.
5. Cloud Services — Cloud migration, hybrid cloud, and managed cloud services.
6. Servers & Storage — Enterprise server and storage solutions (HPE, Dell, Cisco).
7. Physical & Electronic Security — CCTV, access control, and physical security systems.

── CONTACT ──
Email: info@yaronengineering.com
Website pages: Home (/), About (/about), Services (/services), Solutions (/solutions), Industries (/industries), Projects (/projects), Partners (/partners), Careers (/careers), Contact (/contact).
`;

function callGemini(model, messages, apiKey) {
  return new Promise((resolve, reject) => {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    const payload = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 350 },
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 15000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200 && parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
              resolve(parsed.candidates[0].content.parts[0].text);
            } else {
              reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      },
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Gemini API timeout"));
    });
    req.write(payload);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle AI Chat POST endpoint
  if (req.method === "POST" && (url === "/api/ai-chat" || url === "/api/ai-chat/")) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { messages } = JSON.parse(body || "{}");
        if (!Array.isArray(messages) || messages.length === 0) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "messages array required" }));
          return;
        }

        const models = ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.5-flash"];
        let reply = null;
        let lastError = null;

        for (const model of models) {
          try {
            reply = await callGemini(model, messages, GEMINI_API_KEY);
            if (reply) break;
          } catch (err) {
            lastError = err;
          }
        }

        if (reply) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ reply }));
        } else {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: lastError?.message || "AI service temporarily unavailable" }));
        }
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
    return;
  }

  // Static file serving
  let filePath = path.join(DIR, url);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, "index.html");
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else if (fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
    }
  }

  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
    } else {
      filePath = path.join(DIR, "404.html");
      res.statusCode = 404;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Local static preview server running at: http://localhost:${PORT}`);
});
