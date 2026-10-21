"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Users,
  Image as ImageIcon,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  PenSquare,
  Inbox as InboxIcon,
  Bell,
  BellOff,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { admin } from "@/lib/admin/client";
import type { User } from "@/lib/blog/types";
import { LogoMark } from "@/components/ui/Logo";
import { ToastProvider } from "./Toast";
import { InboxProvider, useInbox } from "./InboxContext";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/content", label: "Website content", icon: Globe, adminOnly: true },
  { href: "/admin/articles", label: "Insights", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: InboxIcon, badge: true },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/authors", label: "Authors", icon: Users },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <InboxProvider>
        <Shell>{children}</Shell>
      </InboxProvider>
    </ToastProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { summary, desktopAlerts, enableDesktopAlerts } = useInbox();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasAuth = document.cookie.includes("yaron_admin_auth=1");
      if (!hasAuth) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
    }
    admin
      .get<User>("auth/me")
      .then(setUser)
      .catch(() => {
        setUser({
          id: "1",
          name: "Admin",
          email: "admin@yaronengineering.com",
          role: "ADMIN",
          createdAt: new Date().toISOString(),
        } as User);
      });
  }, [pathname, router]);
  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    document.cookie = "yaron_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/admin/login");
  }

  const items = nav.filter((n) => !n.adminOnly || !user || user?.role === "ADMIN");

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-white/70 px-4">
        <LogoMark size={28} />
        <div className="leading-tight">
          <p className="text-ink-900 text-sm font-semibold">Yaron CMS</p>
          <p className="text-ink-400 font-mono text-[0.6rem] tracking-[0.14em] uppercase">
            Knowledge Hub
          </p>
        </div>
      </div>
      <div className="p-3">
        <Link
          href="/admin/articles/new"
          className="flex h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#3f82dc] to-[#6ca6ee] text-sm font-medium text-white shadow-[0_10px_24px_-10px_rgba(63,130,220,0.8)] transition-[box-shadow,transform] duration-300 hover:-translate-y-px hover:shadow-[0_14px_28px_-10px_rgba(63,130,220,0.9)]"
        >
          <PenSquare className="size-4" aria-hidden /> New article
        </Link>
      </div>
      <nav aria-label="Admin" className="flex-1 px-3">
        <ul className="flex flex-col gap-0.5">
          {items.map((n) => {
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                    active
                      ? "text-ink-900 bg-gradient-to-r from-[#3f82dc]/12 to-[#6ca6ee]/8 font-medium shadow-[inset_0_0_0_1px_rgba(63,130,220,0.15)]"
                      : "text-ink-500 hover:text-ink-900 hover:bg-white/70",
                  )}
                >
                  <n.icon className="size-4" aria-hidden /> {n.label}
                  {"badge" in n && n.badge && summary && summary.unread > 0 && (
                    <span
                      className="bg-brand-500 ml-auto rounded-full px-1.5 py-0.5 font-mono text-[0.6rem] leading-none text-white"
                      aria-label={`${summary.unread} unread messages`}
                    >
                      {summary.unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/70 p-3">
        <button
          type="button"
          onClick={enableDesktopAlerts}
          disabled={desktopAlerts}
          className="text-ink-500 hover:text-ink-900 disabled:text-ink-400 flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm hover:bg-white/70"
          title={
            desktopAlerts
              ? "Desktop alerts are on"
              : "Get a desktop notification when a new message arrives"
          }
        >
          {desktopAlerts ? (
            <Bell className="size-4" aria-hidden />
          ) : (
            <BellOff className="size-4" aria-hidden />
          )}{" "}
          {desktopAlerts ? "Desktop alerts on" : "Enable desktop alerts"}
        </button>
        <Link
          href="/"
          target="_blank"
          className="text-ink-500 hover:text-ink-900 flex h-9 items-center gap-3 rounded-md px-3 text-sm hover:bg-white/70"
        >
          <ExternalLink className="size-4" aria-hidden /> View site
        </Link>
        <Link
          href="/blog"
          target="_blank"
          className="text-ink-500 hover:text-ink-900 flex h-9 items-center gap-3 rounded-md px-3 text-sm hover:bg-white/70"
        >
          <ExternalLink className="size-4" aria-hidden /> View Insights
        </Link>
        <div className="mt-2 flex items-center justify-between rounded-md px-3 py-2">
          <div className="min-w-0">
            <p className="text-ink-900 truncate text-sm font-medium">{user?.name ?? "…"}</p>
            <p className="text-ink-400 font-mono text-[0.6rem] tracking-[0.12em] uppercase">
              {user?.role ?? ""}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="text-ink-400 hover:bg-ink-50 hover:text-ink-900 rounded-md p-1.5"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div data-theme="light" className="text-ink-900 min-h-screen bg-[#eef3fb] antialiased">
        <aside className="glass-sidebar fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">
          {sidebar}
        </aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="bg-ink-950/40 absolute inset-0" onClick={() => setOpen(false)} />
            <aside className="glass-sidebar absolute inset-y-0 left-0 w-64 shadow-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-ink-400 absolute top-3 right-2 rounded-md p-1.5"
              >
                <X className="size-4" />
              </button>
              {sidebar}
            </aside>
          </div>
        )}
        <div className="relative isolate min-h-screen lg:pl-60">
          <div className="admin-grid" aria-hidden />
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/70 bg-white/70 px-4 backdrop-blur-xl lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="text-ink-500 rounded-md p-1.5"
            >
              <Menu className="size-5" />
            </button>
            <LogoMark size={24} />
            <span className="text-sm font-semibold">Yaron CMS</span>
            {summary && summary.unread > 0 && (
              <Link
                href="/admin/messages"
                className="bg-brand-500/10 text-brand-700 ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
                aria-label={`${summary.unread} unread messages`}
              >
                <InboxIcon className="size-3.5" aria-hidden /> {summary.unread}
              </Link>
            )}
          </header>
          <main className="relative z-10 mx-auto max-w-[1800px] p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
