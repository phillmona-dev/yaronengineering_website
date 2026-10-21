# Yaron Engineering — Admin Panel & Content Management Guide

We have implemented a **WordPress-like Admin Panel** directly on your cPanel server. 
You can now update company details, contact information, phone numbers, services, projects, partners, and job vacancies through a web browser — **instantly, without touching code or rebuilding the site**.

---

## 1. How It Works

```
┌────────────────────────────────────────────────────────────────────────┐
│  Admin opens: https://yaronengineering.com/admin/                      │
│  Logs in with password                                                 │
│                                                                        │
│  Edits any content in user-friendly forms                              │
│  (Phones, emails, stats, services, projects, partners, careers)        │
│                                                                        │
│  Clicks "Save" ──► Updates public_html/admin/content.json on cPanel    │
│                     (also creates an automatic dated backup snapshot)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Visitors on https://yaronengineering.com:                             │
│  1. Instant fast-loading static HTML (100% SEO & Googlebot friendly)   │
│  2. Seamlessly updates with the latest content saved by the admin      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Admin Credentials

- **URL:** `https://yaronengineering.com/admin/`
- **Default Password:** `YaronAdmin2024!`

*(You can change the password at any time in the **Settings** tab inside the admin panel).*

---

## 3. How to Deploy to cPanel (Takes 30 Seconds)

### Quick Option: Using `admin-only.zip` (28 KB)

If your website is already running on cPanel, you only need to upload the new `admin/` folder and `.htaccess`:

1. Log into your **cPanel**.
2. Click **File Manager** ➔ open **`public_html`**.
3. Click **Upload** at the top bar.
4. Select `admin-only.zip` from your local project folder:
   `/home/phillmon/Documents/mypros/yaronEngineering/admin-only.zip`
5. Go back to `public_html`, right-click `admin-only.zip` ➔ click **Extract** ➔ **Extract Files**.
6. Delete the `admin-only.zip` file.
7. Done! Visit:
   👉 **`https://yaronengineering.com/admin/`**

---

### Full Update Option: Using `deploy-cpanel-update.zip` (12 MB)

If you want to update the entire static export along with the admin panel:

1. In cPanel **File Manager**, enter **`public_html`**.
2. Click **Upload** ➔ select `deploy-cpanel-update.zip`.
3. Right-click `deploy-cpanel-update.zip` ➔ click **Extract**.
4. Delete the zip file.

---

## 4. What You Can Manage

| Section | What Can Be Updated | Where It Appears on Site |
| :--- | :--- | :--- |
| **🏢 Company Info** | Legal Name, Tagline, Slogan, Founded Year, Address, Main Email, Sales Email, WhatsApp Number, Phone numbers | Header, Footer, Contact Page, About Page, Mobile Menu |
| **🎯 Vision & Mission** | Mission Statement, Vision 2035 Statement, Site Description | About Page, SEO Meta |
| **📊 Stats Counters** | High-impact projects (30+), Clients served (40+), Leadership years (20+), Founded (2018) | Homepage Hero & About Section |
| **🛠️ Services** | Titles, short labels, card summaries for all 7 service areas | Services page, Header dropdown |
| **📁 Projects** | Add, remove, or edit completed projects (Client, Scope, Sector, Year, Highlights, Technologies) | Projects Page |
| **🤝 Partners** | Technology & Enterprise partners (OEMs, Vendors, Clients) | Partners Page & Homepage Ticker |
| **💼 Careers** | Open job vacancies (Title, Team, Location, Type) | Careers Page (shows vacancies or automatic "No vacancies" placeholder) |
| **⚙️ Settings & Backups** | Change password, restore from previous backups | System |

---

## 5. Automatic Backups & Safety

- **Zero Risk:** Every time you click **Save** in any section, the admin panel automatically creates a timestamped backup in `public_html/admin/backups/`.
- **1-Click Restore:** If you ever make a mistake or want to revert changes, open the **Settings** tab and click **↺ Restore** next to any previous version.
