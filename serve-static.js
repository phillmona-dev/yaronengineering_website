const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DIR = path.join(__dirname, "out");
const CONTENT_FILE = path.join(__dirname, "public", "admin", "content.json");
const OUT_CONTENT_FILE = path.join(DIR, "admin", "content.json");
const BACKUP_DIR = path.join(__dirname, "public", "admin", "backups");

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

function loadLocalContent() {
  const target = fs.existsSync(CONTENT_FILE) ? CONTENT_FILE : OUT_CONTENT_FILE;
  try {
    return JSON.parse(fs.readFileSync(target, "utf8"));
  } catch {
    return {};
  }
}

function saveLocalContent(data) {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(BACKUP_DIR, `content_${timestamp}.json`);
  if (fs.existsSync(CONTENT_FILE)) {
    fs.copyFileSync(CONTENT_FILE, backupFile);
  }
  data._meta = data._meta || {};
  data._meta.lastUpdated = new Date().toISOString();
  const jsonStr = JSON.stringify(data, null, 2);
  fs.writeFileSync(CONTENT_FILE, jsonStr, "utf8");
  if (fs.existsSync(path.dirname(OUT_CONTENT_FILE))) {
    fs.writeFileSync(OUT_CONTENT_FILE, jsonStr, "utf8");
  }
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });
  }
  return list;
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderAdminHTML(activeTab, content, message, error, isLoggedIn) {
  if (!isLoggedIn) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Yaron Engineering — Admin Login</title>
<style>
:root{--bg:#0b0d13;--surface:#151824;--border:#262a42;--accent:#3b82f6;--text:#e2e8f0;--muted:#94a3b8}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--text);display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.login-box{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:44px 36px;width:100%;max-width:420px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.6)}
.login-logo{font-size:26px;font-weight:800;margin-bottom:6px;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.login-sub{color:var(--muted);font-size:14px;margin-bottom:28px}
input{width:100%;padding:14px 16px;background:#0d0f17;border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:15px;outline:none;margin-bottom:14px}
input:focus{border-color:var(--accent)}
button{width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer}
button:hover{background:#2563eb}
.error{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#fca5a5;padding:10px;border-radius:8px;font-size:13px;margin-top:14px}
code{background:#1e2338;color:#a78bfa;padding:3px 7px;border-radius:4px;font-size:13px}
</style>
</head>
<body>
<div class="login-box">
  <div class="login-logo">Yaron Engineering</div>
  <div class="login-sub">Admin Panel (Local Preview & cPanel)</div>
  <form method="post" action="/admin/login">
    <input type="password" name="password" placeholder="Enter admin password" autofocus required>
    <button type="submit">Sign In</button>
  </form>
  ${error ? `<div class="error">${esc(error)}</div>` : ""}
  <p style="color:var(--muted);font-size:12px;margin-top:24px">Default password: <code>YaronAdmin2024!</code></p>
</div>
</body>
</html>`;
  }

  const company = content.company || {};
  const hq = company.headquarters || {};
  const contact = company.contact || {};
  const services = content.services?.items || [];
  const projects = content.projects?.items || [];
  const partners = content.partners?.items || [];
  const roles = content.careers?.openRoles || [];
  const stats = content.home?.stats || content.stats || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Yaron Engineering — Admin Panel</title>
<style>
:root{--bg:#0b0d13;--surface:#151824;--surface2:#1c2032;--border:#262a42;--accent:#3b82f6;--accent-hover:#2563eb;--success:#22c55e;--danger:#ef4444;--text:#e2e8f0;--muted:#94a3b8;--radius:10px;--font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh}
a{color:var(--accent);text-decoration:none}
.layout{display:flex;min-height:100vh}
.sidebar{width:250px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.sidebar-logo{padding:22px 20px 18px;font-size:17px;font-weight:800;color:var(--text);border-bottom:1px solid var(--border)}
.sidebar-logo span{color:var(--accent)}
.nav-section{padding:14px 14px 6px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:700}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;color:var(--muted);font-size:14px;font-weight:500;text-decoration:none;transition:.15s;margin:2px 10px}
.nav-item:hover{background:rgba(255,255,255,.05);color:var(--text)}
.nav-item.active{background:rgba(59,130,246,.15);color:#93c5fd;font-weight:600}
.sidebar-footer{margin-top:auto;padding:18px;border-top:1px solid var(--border)}
.main{flex:1;display:flex;flex-direction:column}
.topbar{padding:16px 36px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
.topbar-title{font-size:20px;font-weight:700}
.badge-live{background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.4);color:#86efac;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600}
.btn{display:inline-flex;align-items:center;padding:9px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;text-decoration:none}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:var(--accent-hover)}
.btn-danger{background:var(--danger);color:#fff}
.btn-sm{padding:6px 12px;font-size:12px}
.content-area{padding:36px;flex:1;max-width:1150px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:26px;margin-bottom:24px}
.card-title{font-size:16px;font-weight:700;margin-bottom:18px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.form-full{grid-column:1/-1}
.field{display:flex;flex-direction:column;gap:6px}
label{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
input,textarea,select{background:#0e1019;border:1px solid var(--border);border-radius:8px;color:var(--text);padding:10px 14px;font-size:14px;font-family:inherit;outline:none;width:100%}
input:focus,textarea:focus{border-color:var(--accent)}
textarea{resize:vertical;min-height:85px;line-height:1.5}
.form-actions{margin-top:20px;display:flex;justify-content:flex-end;border-top:1px solid var(--border);padding-top:16px}
.alert{padding:14px 18px;border-radius:var(--radius);margin-bottom:20px;font-size:14px;font-weight:500}
.alert-success{background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#86efac}
.alert-danger{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5}
.repeater-item{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:12px}
.repeater-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.repeater-num{background:var(--accent);color:#fff;width:24px;height:24px;border-radius:50%;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center}
.dash-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;margin-bottom:24px}
.dash-stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;text-align:center}
.dash-stat-num{font-size:34px;font-weight:800;color:var(--accent);margin-bottom:4px}
.dash-stat-label{color:var(--muted);font-size:13px}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.stat-card{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px}
code{background:#1e2338;color:#a78bfa;padding:3px 7px;border-radius:4px;font-size:13px}
</style>
</head>
<body>
<div class="layout">
  <nav class="sidebar">
    <div class="sidebar-logo">⚡ <span>Yaron</span> Admin</div>
    <div class="nav-section">Manage Content</div>
    <a href="/admin?tab=company"  class="nav-item ${activeTab === "company" ? "active" : ""}">🏢 Company Info</a>
    <a href="/admin?tab=services" class="nav-item ${activeTab === "services" ? "active" : ""}">🛠️ Services (${services.length})</a>
    <a href="/admin?tab=projects" class="nav-item ${activeTab === "projects" ? "active" : ""}">📁 Projects (${projects.length})</a>
    <a href="/admin?tab=partners" class="nav-item ${activeTab === "partners" ? "active" : ""}">🤝 Partners (${partners.length})</a>
    <a href="/admin?tab=careers"  class="nav-item ${activeTab === "careers" ? "active" : ""}">💼 Careers (${roles.length})</a>
    <div class="nav-section">System</div>
    <a href="/admin?tab=settings" class="nav-item ${activeTab === "settings" ? "active" : ""}">⚙️ Settings & Info</a>
    <div class="sidebar-footer">
      <form method="post" action="/admin/logout">
        <button type="submit" class="btn btn-danger btn-sm" style="width:100%">Sign Out</button>
      </form>
    </div>
  </nav>

  <div class="main">
    <div class="topbar">
      <div class="topbar-title">Content Management</div>
      <div style="display:flex;align-items:center;gap:12px">
        <span class="badge-live">● Running Locally & on cPanel</span>
        <a href="/" target="_blank" class="btn" style="background:var(--surface2);border:1px solid var(--border)">🌐 View Live Site</a>
      </div>
    </div>

    <div class="content-area">
      ${message ? `<div class="alert alert-success">${esc(message)}</div>` : ""}
      ${error ? `<div class="alert alert-danger">${esc(error)}</div>` : ""}

      ${
        activeTab === "company"
          ? `
      <div class="dash-stats">
        <div class="dash-stat"><div class="dash-stat-num">${services.length}</div><div class="dash-stat-label">Services</div></div>
        <div class="dash-stat"><div class="dash-stat-num">${projects.length}</div><div class="dash-stat-label">Projects</div></div>
        <div class="dash-stat"><div class="dash-stat-num">${partners.length}</div><div class="dash-stat-label">Partners</div></div>
        <div class="dash-stat"><div class="dash-stat-num">${roles.length}</div><div class="dash-stat-label">Open Roles</div></div>
      </div>

      <form method="post" action="/admin/save?tab=company">
        <input type="hidden" name="action" value="save_company">
        <div class="card">
          <div class="card-title">🏢 Company Information</div>
          <div class="form-grid">
            <div class="field form-full"><label>Company Legal Name</label><input type="text" name="name" value="${esc(company.name)}" required></div>
            <div class="field"><label>Tagline</label><input type="text" name="tagline" value="${esc(company.tagline)}"></div>
            <div class="field"><label>Slogan</label><input type="text" name="slogan" value="${esc(company.slogan)}"></div>
            <div class="field"><label>Founded Year</label><input type="number" name="founded" value="${esc(company.founded)}"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">📍 Address & Contact Information</div>
          <div class="form-grid">
            <div class="field form-full"><label>Street Address</label><input type="text" name="streetAddress" value="${esc(hq.streetAddress)}"></div>
            <div class="field"><label>City</label><input type="text" name="city" value="${esc(hq.city)}"></div>
            <div class="field"><label>Country</label><input type="text" name="country" value="${esc(hq.country)}"></div>
            <div class="field"><label>Main Email</label><input type="email" name="email" value="${esc(contact.email)}" required></div>
            <div class="field"><label>Sales Email</label><input type="email" name="salesEmail" value="${esc(contact.salesEmail)}"></div>
            <div class="field"><label>WhatsApp Number</label><input type="text" name="whatsapp" value="${esc(contact.whatsapp)}"></div>
            <div class="field form-full"><label>Phone Numbers (one per line)</label>
              <textarea name="phones" rows="3">${esc((contact.phones || []).join("\n"))}</textarea>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">🎯 Vision, Mission & Description</div>
          <div class="field" style="margin-bottom:14px"><label>Vision Statement</label><textarea name="vision" rows="3">${esc(company.vision)}</textarea></div>
          <div class="field" style="margin-bottom:14px"><label>Mission Statement</label><textarea name="mission" rows="3">${esc(company.mission)}</textarea></div>
          <div class="field"><label>Company Description</label><textarea name="description" rows="3">${esc(company.description)}</textarea></div>
        </div>

        <div class="card">
          <div class="card-title">📊 Key Statistics (Homepage counters)</div>
          <div class="stats-grid">
            ${stats
              .map(
                (s) => `
            <div class="stat-card">
              <div class="form-grid-3" style="margin-bottom:8px">
                <div class="field"><label>Value</label><input type="number" name="stat_value" value="${esc(s.value)}" required></div>
                <div class="field"><label>Suffix</label><input type="text" name="stat_suffix" value="${esc(s.suffix)}" placeholder="+"></div>
              </div>
              <div class="field" style="margin-bottom:8px"><label>Label</label><input type="text" name="stat_label" value="${esc(s.label)}" required></div>
              <div class="field"><label>Note</label><input type="text" name="stat_note" value="${esc(s.note)}"></div>
            </div>`,
              )
              .join("")}
          </div>
        </div>

        <div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save Company Info</button></div>
      </form>`
          : ""
      }

      ${
        activeTab === "services"
          ? `
      <form method="post" action="/admin/save?tab=services">
        <input type="hidden" name="action" value="save_services">
        ${services
          .map(
            (svc, i) => `
        <div class="repeater-item">
          <div class="repeater-header">
            <span><span class="repeater-num">${i + 1}</span> &nbsp;<strong>${esc(svc.title)}</strong></span>
          </div>
          <div class="form-grid">
            <div class="field"><label>Slug</label><input type="text" name="svc_slug" value="${esc(svc.slug)}" required></div>
            <div class="field"><label>Short Title</label><input type="text" name="svc_short" value="${esc(svc.shortTitle)}" required></div>
            <div class="field form-full"><label>Full Title</label><input type="text" name="svc_title" value="${esc(svc.title)}" required></div>
            <div class="field form-full"><label>Summary</label><textarea name="svc_summary" rows="2">${esc(svc.summary)}</textarea></div>
          </div>
        </div>`,
          )
          .join("")}
        <div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save All Services</button></div>
      </form>`
          : ""
      }

      ${
        activeTab === "projects"
          ? `
      <form method="post" action="/admin/save?tab=projects">
        <input type="hidden" name="action" value="save_projects">
        ${projects
          .map(
            (p, i) => `
        <div class="repeater-item">
          <div class="repeater-header">
            <span><span class="repeater-num">${i + 1}</span> &nbsp;<strong>${esc(p.client)}</strong> — ${esc(p.name)}</span>
          </div>
          <div class="form-grid">
            <div class="field"><label>Project ID</label><input type="text" name="proj_id" value="${esc(p.id)}" required></div>
            <div class="field"><label>Group</label><input type="text" name="proj_group" value="${esc(p.group)}"></div>
            <div class="field"><label>Client</label><input type="text" name="proj_client" value="${esc(p.client)}" required></div>
            <div class="field"><label>Project Title</label><input type="text" name="proj_name" value="${esc(p.name)}" required></div>
            <div class="field"><label>Sector</label><input type="text" name="proj_sector" value="${esc(p.sector)}"></div>
            <div class="field"><label>Year</label><input type="text" name="proj_year" value="${esc(p.year)}"></div>
            <div class="field form-full"><label>Location</label><input type="text" name="proj_location" value="${esc(p.location)}"></div>
            <div class="field form-full"><label>Summary</label><textarea name="proj_summary" rows="2">${esc(p.summary)}</textarea></div>
          </div>
        </div>`,
          )
          .join("")}
        <div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save All Projects</button></div>
      </form>`
          : ""
      }

      ${
        activeTab === "partners"
          ? `
      <form method="post" action="/admin/save?tab=partners">
        <input type="hidden" name="action" value="save_partners">
        ${partners
          .map(
            (p, i) => `
        <div class="repeater-item">
          <div class="repeater-header">
            <span><span class="repeater-num">${i + 1}</span> &nbsp;<strong>${esc(p.name)}</strong></span>
          </div>
          <div class="form-grid-3">
            <div class="field"><label>Partner Name</label><input type="text" name="p_name" value="${esc(p.name)}" required></div>
            <div class="field"><label>Category</label><input type="text" name="p_category" value="${esc(p.category)}"></div>
            <div class="field"><label>URL</label><input type="url" name="p_url" value="${esc(p.url)}"></div>
          </div>
        </div>`,
          )
          .join("")}
        <div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save Partners</button></div>
      </form>`
          : ""
      }

      ${
        activeTab === "careers"
          ? `
      <form method="post" action="/admin/save?tab=careers">
        <input type="hidden" name="action" value="save_careers">
        <div style="margin-bottom:16px;color:var(--muted);font-size:14px">Currently ${roles.length} active vacancies. Open vacancies appear on the Careers page.</div>
        ${roles
          .map(
            (r, i) => `
        <div class="repeater-item">
          <div class="repeater-header"><span><span class="repeater-num">${i + 1}</span> &nbsp;<strong>${esc(r.title)}</strong></span></div>
          <div class="form-grid">
            <div class="field"><label>Job Title</label><input type="text" name="role_title" value="${esc(r.title)}" required></div>
            <div class="field"><label>Department</label><input type="text" name="role_team" value="${esc(r.team)}"></div>
            <div class="field"><label>Location</label><input type="text" name="role_location" value="${esc(r.location)}"></div>
            <div class="field"><label>Type</label><input type="text" name="role_type" value="${esc(r.type)}"></div>
          </div>
        </div>`,
          )
          .join("")}
        <div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save Career Roles</button></div>
      </form>`
          : ""
      }

      ${
        activeTab === "settings"
          ? `
      <div class="card">
        <div class="card-title">📖 Content Management & Deployment</div>
        <div style="font-size:14px;line-height:1.8;color:var(--muted)">
          <p><strong style="color:var(--text)">Live Sync:</strong> Changes saved here write to <code>content.json</code>. Visitors see your updates immediately.</p>
          <br>
          <p><strong style="color:var(--text)">cPanel Deployment:</strong> Upload <code>admin-only.zip</code> or <code>deploy-cpanel-update.zip</code> to <code>public_html/</code> on your cPanel server.</p>
          <br>
          <p><strong style="color:var(--text)">Password:</strong> Default password is <code>YaronAdmin2024!</code>.</p>
        </div>
      </div>`
          : ""
      }
    </div>
  </div>
</div>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 1. AI Chat Endpoint
  if (req.method === "POST" && (pathname === "/api/ai-chat" || pathname === "/api/ai-chat/")) {
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

  // 2. Admin Content JSON direct endpoint
  if (pathname === "/admin/content.json") {
    const data = loadLocalContent();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
    return;
  }

  // 3. Admin Login & Logout handlers
  if (pathname === "/admin/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const pass = params.get("password");
      if (pass === "YaronAdmin2024!") {
        res.writeHead(302, {
          "Set-Cookie": "yaron_admin=1; Path=/admin; HttpOnly",
          Location: "/admin",
        });
        res.end();
      } else {
        const html = renderAdminHTML("company", loadLocalContent(), "", "Incorrect password. Default: YaronAdmin2024!", false);
        res.statusCode = 401;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(html);
      }
    });
    return;
  }

  if (pathname === "/admin/logout") {
    res.writeHead(302, {
      "Set-Cookie": "yaron_admin=; Path=/admin; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      Location: "/admin",
    });
    res.end();
    return;
  }

  // 4. Admin Save Handlers
  if (pathname === "/admin/save" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const action = params.get("action");
      const currentTab = parsedUrl.searchParams.get("tab") || "company";
      const content = loadLocalContent();

      if (action === "save_company") {
        content.company = content.company || {};
        content.company.name = params.get("name") || content.company.name;
        content.company.tagline = params.get("tagline") || content.company.tagline;
        content.company.slogan = params.get("slogan") || content.company.slogan;
        content.company.founded = parseInt(params.get("founded") || "2018", 10);
        content.company.headquarters = content.company.headquarters || {};
        content.company.headquarters.streetAddress = params.get("streetAddress") || "";
        content.company.headquarters.city = params.get("city") || "";
        content.company.headquarters.country = params.get("country") || "";
        content.company.contact = content.company.contact || {};
        content.company.contact.email = params.get("email") || "";
        content.company.contact.salesEmail = params.get("salesEmail") || "";
        content.company.contact.whatsapp = params.get("whatsapp") || "";
        content.company.contact.phones = (params.get("phones") || "")
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean);
        content.company.vision = params.get("vision") || "";
        content.company.mission = params.get("mission") || "";
        content.company.description = params.get("description") || "";

        // Stats
        const statVals = params.getAll("stat_value");
        const statSuffixes = params.getAll("stat_suffix");
        const statLabels = params.getAll("stat_label");
        const statNotes = params.getAll("stat_note");
        if (statVals.length > 0) {
          const newStats = statVals.map((v, i) => ({
            value: parseInt(v || "0", 10),
            suffix: statSuffixes[i] || "",
            label: statLabels[i] || "",
            note: statNotes[i] || "",
            plain: !statSuffixes[i],
          }));
          content.home = content.home || {};
          content.home.stats = newStats;
          content.stats = newStats;
        }

        saveLocalContent(content);
      }

      if (action === "save_services") {
        const slugs = params.getAll("svc_slug");
        const shorts = params.getAll("svc_short");
        const titles = params.getAll("svc_title");
        const summaries = params.getAll("svc_summary");
        content.services = content.services || { items: [] };
        content.services.items = slugs.map((slug, i) => {
          const existing = content.services.items.find((s) => s.slug === slug) || {};
          return {
            ...existing,
            slug,
            shortTitle: shorts[i] || slug,
            title: titles[i] || slug,
            summary: summaries[i] || "",
          };
        });
        saveLocalContent(content);
      }

      const redirectTab = currentTab;
      res.writeHead(302, { Location: `/admin?tab=${encodeURIComponent(redirectTab)}&saved=1` });
      res.end();
    });
    return;
  }

  // 5. Admin Panel UI Route
  if (pathname === "/admin" || pathname === "/admin/") {
    const cookies = parseCookies(req);
    const isLoggedIn = cookies.yaron_admin === "1";
    const activeTab = parsedUrl.searchParams.get("tab") || "company";
    const saved = parsedUrl.searchParams.get("saved") === "1";
    const msg = saved ? "✅ Changes saved successfully! Site content updated." : "";
    const html = renderAdminHTML(activeTab, loadLocalContent(), msg, "", isLoggedIn);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
    return;
  }

  // 6. Regular Static File Serving
  let filePath = path.join(DIR, pathname);

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
  console.log(`Local preview server is live:`);
  console.log(`- Website:     http://localhost:${PORT}`);
  console.log(`- Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`- AI Endpoint: http://localhost:${PORT}/api/ai-chat`);
});
