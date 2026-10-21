"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Check,
  Mail,
  MailOpen,
  Reply,
  Search,
  Trash2,
  Building2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { admin, qs } from "@/lib/admin/client";
import type { ContactMessage, ContactStatus, ContactSummary, Page, User } from "@/lib/blog/types";
import { formatDateTime, timeAgo } from "@/lib/blog/format";
import { cn } from "@/lib/utils/cn";
import { AdminButton, ConfirmDialog, PageHeader, Pagination, inputCls } from "./ui";
import { useToast } from "./Toast";
import { useInbox } from "./InboxContext";

const FILTERS: { key: ContactStatus | ""; label: string }[] = [
  { key: "", label: "All" },
  { key: "NEW", label: "Unread" },
  { key: "READ", label: "Read" },
  { key: "REPLIED", label: "Replied" },
  { key: "ARCHIVED", label: "Archived" },
];

const statusCls: Record<ContactStatus, string> = {
  NEW: "bg-gold-500/15 text-gold-700 ring-1 ring-inset ring-gold-500/40",
  READ: "bg-ink-900/6 text-ink-600 ring-1 ring-inset ring-ink-900/10",
  REPLIED: "bg-brand-500/10 text-brand-700 ring-1 ring-inset ring-brand-500/20",
  ARCHIVED: "bg-ink-900/6 text-ink-400 ring-1 ring-inset ring-ink-900/10",
};

function Avatar({ name, unread }: { name: string; unread?: boolean }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full font-mono text-[0.68rem] tracking-[0.08em] text-white",
        unread
          ? "bg-gradient-to-br from-[#d9a90c] to-[#fbd84a] text-[#143a8c] shadow-[0_8px_18px_-8px_rgba(245,197,24,0.8)]"
          : "from-ink-400 to-ink-300 bg-gradient-to-br",
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Inbox({ user }: { user: User | null }) {
  const toast = useToast();
  const { refresh: refreshBadge, summary } = useInbox();
  const [filter, setFilter] = useState<ContactStatus | "">("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState<Page<ContactMessage> | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);

  const load = useCallback(
    (p = 0) => {
      admin
        .get<Page<ContactMessage>>(
          `contact-messages${qs({ page: p, size: 25, status: filter, q })}`,
        )
        .then(setPage)
        .catch((e) => toast("error", e.message));
    },
    [filter, q, toast],
  );
  useEffect(() => load(0), [load]);

  const counts: ContactSummary | null = summary;

  const applyUpdate = useCallback(
    (m: ContactMessage) => {
      setSelected(m);
      setPage((p) => {
        if (!p) return p;
        if (Array.isArray(p)) return (p as ContactMessage[]).map((x) => (x.id === m.id ? m : x)) as unknown as Page<ContactMessage>;
        return { ...p, content: (p.content || []).map((x) => (x.id === m.id ? m : x)) };
      });
      refreshBadge();
    },
    [refreshBadge],
  );

  async function open(m: ContactMessage) {
    setSelected(m);
    setNotes(m.notes ?? "");
    setNotesDirty(false);
    if (m.status === "NEW") {
      try {
        applyUpdate(await admin.post<ContactMessage>(`contact-messages/${m.id}/read`));
      } catch (err) {
        toast("error", err instanceof Error ? err.message : "Could not mark as read");
      }
    }
  }

  async function act(action: "unread" | "replied" | "archive" | "read") {
    if (!selected) return;
    setBusy(action);
    try {
      applyUpdate(await admin.post<ContactMessage>(`contact-messages/${selected.id}/${action}`));
      toast(
        "success",
        {
          unread: "Marked as unread.",
          replied: "Marked as replied.",
          archive: "Archived.",
          read: "Marked as read.",
        }[action],
      );
      if (filter && action !== "read") load(page?.page ?? 0);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setBusy("notes");
    try {
      applyUpdate(
        await admin.put<ContactMessage>(`contact-messages/${selected.id}/notes`, { notes }),
      );
      setNotesDirty(false);
      toast("success", "Notes saved.");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not save notes");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!selected) return;
    setBusy("delete");
    try {
      await admin.del(`contact-messages/${selected.id}`);
      toast("success", "Message deleted.");
      setConfirmDelete(false);
      setSelected(null);
      load(page?.page ?? 0);
      refreshBadge();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  const replyHref = useMemo(() => {
    if (!selected) return "#";
    const subject = encodeURIComponent(`Re: ${selected.subject} — Yaron Engineering`);
    const body = encodeURIComponent(
      `Dear ${selected.name.split(" ")[0]},\n\nThank you for contacting Yaron Engineering.\n\n\n\n---\nYour message:\n${selected.message}`,
    );
    return `mailto:${selected.email}?subject=${subject}&body=${body}`;
  }, [selected]);

  return (
    <>
      <PageHeader
        title="Messages"
        description="Enquiries submitted through the website contact form."
        actions={
          counts && (
            <div className="flex gap-2">
              {(
                [
                  ["unread", counts.unread, "text-gold-700"],
                  ["last 24h", counts.last24h, "text-brand-700"],
                  ["total", counts.total, "text-ink-900"],
                ] as const
              ).map(([label, n, tone]) => (
                <span
                  key={label}
                  className="glass glass-strong flex min-w-[5.5rem] flex-col items-center rounded-2xl px-3 py-2"
                >
                  <strong className={cn("text-lg leading-none font-semibold tabular-nums", tone)}>
                    {n}
                  </strong>
                  <span className="text-ink-400 mt-1 font-mono text-[0.58rem] tracking-[0.12em] uppercase">
                    {label}
                  </span>
                </span>
              ))}
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
        {/* List */}
        <section
          className="glass flex min-w-0 flex-col overflow-hidden lg:max-h-[calc(100vh-11rem)]"
          aria-label="Message list"
        >
          <div className="border-b border-white/70 bg-white/25 p-3">
            <div className="relative">
              <Search
                className="text-ink-400 pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
                aria-hidden
              />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, subject…"
                aria-label="Search messages"
                className={`${inputCls} pl-8`}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1" role="tablist" aria-label="Filter">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-[background,color,box-shadow] duration-300",
                    filter === f.key
                      ? "bg-gradient-to-r from-[#3f82dc] to-[#6ca6ee] text-white shadow-[0_8px_20px_-8px_rgba(63,130,220,0.9)]"
                      : "text-ink-500 hover:text-ink-900 hover:bg-white/80",
                  )}
                >
                  {f.label}
                  {f.key === "NEW" && counts && counts.unread > 0 && (
                    <span
                      className={cn(
                        "ml-1.5 rounded-full px-1.5 font-mono text-[0.6rem]",
                        filter === "NEW" ? "bg-white/25" : "bg-gold-500 text-ink-900",
                      )}
                    >
                      {counts.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <ul className="max-h-[60vh] flex-1 overflow-y-auto lg:max-h-none">
            {page === null ? (
              Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="border-b border-white/70 p-4">
                  <div className="dash-shimmer h-3.5 w-1/2 rounded" />
                  <div className="dash-shimmer mt-2 h-3 w-3/4 rounded" />
                </li>
              ))
            ) : (Array.isArray(page) ? page : (page?.content || [])).length === 0 ? (
              <li className="text-ink-400 p-10 text-center text-sm">
                <Mail className="mx-auto mb-2 size-5" aria-hidden />
                No messages{filter ? " in this view" : " yet"}.
              </li>
            ) : (
              (Array.isArray(page) ? page : (page?.content || [])).map((m) => {
                const unread = m.status === "NEW";
                const active = selected?.id === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => open(m)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full gap-3 border-b border-white/70 px-4 py-3 text-left transition-colors hover:bg-white/60",
                        active &&
                          "bg-gradient-to-r from-[#3f82dc]/12 to-transparent shadow-[inset_3px_0_0_#3f82dc]",
                      )}
                    >
                      <Avatar name={m.name} unread={unread} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              "truncate text-sm",
                              unread ? "text-ink-900 font-semibold" : "text-ink-700",
                            )}
                          >
                            {m.name}
                          </span>
                          <span className="text-ink-400 shrink-0 font-mono text-[0.6rem]">
                            {timeAgo(m.createdAt)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-xs",
                            unread ? "text-ink-900 font-medium" : "text-ink-600",
                          )}
                        >
                          {m.subject}
                        </span>
                        <span className="text-ink-400 mt-0.5 block truncate text-xs">
                          {m.message}
                        </span>
                      </span>
                      {unread && (
                        <span
                          className="bg-gold-500 mt-2 size-2 shrink-0 rounded-full shadow-[0_0_0_3px_rgba(245,197,24,0.25)]"
                          aria-label="Unread"
                        />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          {page && (
            <Pagination
              page={page.page}
              totalPages={page.totalPages}
              last={page.last}
              onPage={load}
              labels={["Newer", "Older"]}
            />
          )}
        </section>

        {/* Detail */}
        <section className="glass min-w-0 overflow-hidden" aria-label="Message">
          {!selected ? (
            <div className="text-ink-400 flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center">
              <MailOpen className="size-8" aria-hidden />
              <p className="mt-3 text-sm">Select a message to read it.</p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/70 bg-white/25 p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={selected.name} unread={selected.status === "NEW"} />
                  <div>
                    <h2 className="text-ink-900 text-lg leading-tight font-semibold break-words">
                      {selected.subject}
                    </h2>
                    <p className="text-ink-700 mt-1 text-sm">
                      <span className="font-medium">{selected.name}</span> ·{" "}
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-brand-600 break-all hover:underline"
                      >
                        {selected.email}
                      </a>
                    </p>
                    <p className="text-ink-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.62rem] tracking-[0.1em] uppercase">
                      {selected.organization && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="size-3" aria-hidden />
                          {selected.organization}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" aria-hidden />
                        {formatDateTime(selected.createdAt)}
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5", statusCls[selected.status])}>
                        {selected.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={replyHref}
                    onClick={() => {
                      if (selected.status !== "REPLIED") act("replied");
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#3f82dc] to-[#6ca6ee] px-3.5 text-sm font-medium text-white shadow-[0_10px_24px_-10px_rgba(63,130,220,0.8)] transition-[box-shadow,transform] duration-300 hover:-translate-y-px"
                  >
                    <Reply className="size-4" aria-hidden /> Reply by email
                  </a>
                  {selected.status !== "REPLIED" && (
                    <AdminButton onClick={() => act("replied")} loading={busy === "replied"}>
                      <Check className="size-4" aria-hidden /> Mark replied
                    </AdminButton>
                  )}
                  {selected.status === "NEW" ? (
                    <AdminButton onClick={() => act("read")} loading={busy === "read"}>
                      <MailOpen className="size-4" aria-hidden /> Mark read
                    </AdminButton>
                  ) : (
                    <AdminButton onClick={() => act("unread")} loading={busy === "unread"}>
                      <Mail className="size-4" aria-hidden /> Mark unread
                    </AdminButton>
                  )}
                  {selected.status !== "ARCHIVED" ? (
                    <AdminButton onClick={() => act("archive")} loading={busy === "archive"}>
                      <Archive className="size-4" aria-hidden /> Archive
                    </AdminButton>
                  ) : (
                    <AdminButton onClick={() => act("read")} loading={busy === "read"}>
                      <RotateCcw className="size-4" aria-hidden /> Restore
                    </AdminButton>
                  )}
                  {user?.role === "ADMIN" && (
                    <AdminButton
                      variant="danger"
                      onClick={() => setConfirmDelete(true)}
                      aria-label="Delete message"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </AdminButton>
                  )}
                </div>
              </header>
              <div className="flex-1 p-5">
                <p className="text-ink-900 text-[0.9375rem] leading-relaxed break-words whitespace-pre-wrap">
                  {selected.message}
                </p>
                {selected.repliedAt && (
                  <p className="bg-brand-500/10 text-brand-700 ring-brand-500/30 mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ring-inset">
                    <Check className="size-3.5" aria-hidden /> Replied{" "}
                    {formatDateTime(selected.repliedAt)}
                  </p>
                )}
              </div>
              <div className="border-t border-white/70 bg-white/25 p-5">
                <label htmlFor="notes" className="text-ink-500 mb-1.5 block text-xs font-medium">
                  Internal notes{" "}
                  <span className="text-ink-400 font-normal">(not visible to the sender)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setNotesDirty(true);
                  }}
                  placeholder="Call summary, next steps, owner…"
                  className={inputCls}
                />
                <div className="mt-2 flex justify-end">
                  <AdminButton
                    size="sm"
                    variant={notesDirty ? "primary" : "secondary"}
                    disabled={!notesDirty}
                    loading={busy === "notes"}
                    onClick={saveNotes}
                  >
                    Save notes
                  </AdminButton>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this message?"
        text="The message and its notes are removed permanently. Consider archiving instead."
        confirmLabel="Delete"
        danger
        loading={busy === "delete"}
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
