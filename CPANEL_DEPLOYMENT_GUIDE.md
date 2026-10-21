# Yaron Engineering — cPanel Deployment Guide

This guide explains how to deploy the static website to **YegaraHost cPanel** and configure the **AI Chat (Cloudflare Worker)** and **Contact Form (Formspree)**.

---

## 1. Project Overview

The website has been reconfigured as a high-performance **static export** (`output: 'export'`):
- **No Node.js, Docker, Java or PostgreSQL needed** on the server.
- All marketing pages, animations, styles, and assets compile directly into standard HTML, CSS, and JS files located in the `out/` directory.
- The build outputs an Apache `.htaccess` configured for URL routing, security headers, Gzip compression, and aggressive asset caching.

---

## 2. Deploying to cPanel (YegaraHost)

### Step A: Build the Static Site
Run the build command on your development machine:
```bash
npm run build
```
This generates the ready-to-upload `out/` directory.

### Step B: Create a ZIP Archive of `out/`
```bash
cd out && zip -r ../yaron-static-site.zip . && cd ..
```

### Step C: Upload via cPanel File Manager
1. Log in to cPanel at **`https://my.yegara.com/`** (or your cPanel URL).
2. Open **File Manager**.
3. Navigate to **`public_html`** (or the document root of `yaronengineering.com`).
   - If there are existing default files, you can back them up or clear them.
4. Click **Upload** in the top toolbar and select `yaron-static-site.zip`.
5. Once uploaded, right-click `yaron-static-site.zip` and select **Extract** directly into `public_html`.
6. Ensure that the hidden file **`.htaccess`** was extracted (in File Manager Settings, enable "Show Hidden Files").
7. Delete the uploaded `.zip` archive to save disk space.

---

## 3. Configuring the AI Chat (Gemini via Cloudflare Worker)

Because cPanel shared hosting does not run server-side Node.js or Java, the AI assistant communicates via a free, server-side **Cloudflare Worker** proxy:
- The Google Gemini API key is stored securely in Cloudflare's encrypted secrets (never visible to site visitors).
- Cloudflare Workers Free Tier includes **100,000 requests per day**.

### Steps to Set Up:
1. **Create an account** on [Cloudflare](https://dash.cloudflare.com/) (100% Free).
2. Navigate to **Workers & Pages** → **Create application** → **Create Worker**.
3. Name your worker (e.g., `yaron-ai-chat`).
4. Replace the default script with the contents of:
   [`cloudflare-worker/ai-chat-worker.js`](./cloudflare-worker/ai-chat-worker.js)
5. Click **Deploy**.
6. In your Worker dashboard, go to **Settings** → **Variables and Secrets** → **Add Secret**:
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
7. Copy your deployed Worker URL:
   `https://yaron-ai-chat.<your-subdomain>.workers.dev/chat`
8. In `.env.local` (or during build), set:
   ```env
   NEXT_PUBLIC_AI_WORKER_URL=https://yaron-ai-chat.<your-subdomain>.workers.dev/chat
   ```
9. Rebuild (`npm run build`) and upload the updated `out/` to cPanel.

---

## 4. Configuring the Contact Form (Formspree)

Form submissions are securely sent using Formspree without requiring a backend database:
1. Create a free account at [Formspree](https://formspree.io/).
2. Click **+ New Form**, name it "Yaron Engineering Contact", and set the destination email address (e.g., `info@yaronengineering.com` or `sales@yaronengineering.com`).
3. Formspree will provide a Form ID (e.g., `xvgpkqab`).
4. Set in `.env.local`:
   ```env
   NEXT_PUBLIC_FORMSPREE_ID=xvgpkqab
   ```
5. Rebuild (`npm run build`) and re-deploy.

---

## 5. Domain & DNS Configuration

In GoDaddy (Domain Portfolio → `yaronengineering.com` → DNS):
1. Keep or set the A record `@` pointing to the YegaraHost cPanel server IP (found in your cPanel dashboard right-hand sidebar under "Shared IP Address").
2. Ensure `www` CNAME points to `yaronengineering.com`.
3. In cPanel, navigate to **SSL/TLS Status** and run **AutoSSL** to ensure free HTTPS certificates are active.
