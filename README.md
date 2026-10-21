# Yaron Engineering PLC — Corporate Website

Corporate website for **Yaron Engineering PLC** (Addis Ababa, Ethiopia) — ICT infrastructure, cybersecurity, data center, cloud and enterprise technology systems integrator.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. Reconfigured for static hosting on **cPanel** (Apache) with client-side AI integration and serverless form processing.

---

## Key Features

- **Static Export Architecture**: Compiles directly into standard HTML, CSS, and JS (`npm run build` → `out/`) ready for direct upload to cPanel `public_html`.
- **AI Assistant (Gemini)**: Embedded AI chatbot powered by Google Gemini (`gemini-3.8-flash` / `gemini-3.5-flash-lite`).
  - Locally: Handled by `serve-static.js` proxy.
  - On cPanel: Handled natively by `api/ai-chat.php` without requiring third-party serverless accounts.
  - Optional: Cloudflare Worker script included in `cloudflare-worker/`.
- **Contact Inquiries**: Formspree form submission delivering inquiries directly to team email.
- **Enterprise SEO**: Built-in static `sitemap.xml`, `robots.txt`, JSON-LD structured data, and dynamic OpenGraph social card.
- **Apache `.htaccess`**: Pre-configured with security headers, Gzip compression, browser caching, and clean URL routing.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view in the browser.

### 3. Static Build & Preview
```bash
npm run build
node serve-static.js
```
Open [http://localhost:3000](http://localhost:3000) to preview the static production export.

---

## cPanel Deployment

See [`CPANEL_DEPLOYMENT_GUIDE.md`](./CPANEL_DEPLOYMENT_GUIDE.md) for step-by-step instructions.

1. Run `npm run build`.
2. Zip the contents of the `out/` folder:
   ```bash
   cd out && zip -r ../yaron-static-site.zip . && cd ..
   ```
3. Upload `yaron-static-site.zip` to cPanel File Manager in `public_html` and click **Extract**.
4. Ensure `.htaccess` and `api/ai-chat.php` are extracted in `public_html`.

---

## Project Structure

```
app/                 Routes & static pages (About, Services, Solutions, Industries, Projects, Partners, Careers, Contact)
components/          UI primitives, animations, navigation, layout, and AiChat widget
lib/data/            Source of truth content (company, services, industries, projects, partners, navigation)
public/              Static assets, logos, photos, Apache .htaccess, and api/ai-chat.php
cloudflare-worker/   Optional Cloudflare Worker script for Gemini AI proxy
out/                 Generated static output (created after npm run build)
serve-static.js      Zero-dependency local server with Gemini AI proxy
```
