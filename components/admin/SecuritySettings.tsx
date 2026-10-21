"use client";

import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Clock, MailWarning } from "lucide-react";
import { admin, AdminApiError } from "@/lib/admin/client";
import type { SecurityOverview } from "@/lib/blog/types";
import { AdminButton, Card, Field, PageHeader } from "./ui";
import { useToast } from "./Toast";
import { NewPasswordFields, PasswordInput, passwordIsValid } from "./PasswordFields";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function SecuritySettings() {
  const toast = useToast();
  const [info, setInfo] = useState<SecurityOverview | null>(null);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [currentError, setCurrentError] = useState("");
  const [newError, setNewError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    admin
      .get<SecurityOverview>("auth/security")
      .then(setInfo)
      .catch((e) => toast("error", e.message));
  }, [toast]);

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCurrentError("");
    setNewError("");
    if (!passwordIsValid(password, confirm)) {
      setNewError("Please satisfy every rule below.");
      return;
    }
    setSaving(true);
    try {
      await admin.post("auth/change-password", {
        currentPassword: current,
        newPassword: password,
      });

      const nowIso = new Date().toISOString();
      setCurrent("");
      setPassword("");
      setConfirm("");
      setInfo((i) => (i ? { ...i, passwordChangedAt: nowIso } : i));
      toast("success", "Password updated successfully. Other devices have been signed out.");
    } catch (err) {
      if (err instanceof AdminApiError && err.errors && err.errors.length > 0) {
        const cur = err.errors.find((x) => x.field === "currentPassword");
        const nw = err.errors.find((x) => x.field === "newPassword");
        if (cur) setCurrentError("The current password is incorrect.");
        if (nw) setNewError(`Password ${nw.message}.`);
        if (!cur && !nw) toast("error", err.message);
      } else {
        const msg = err instanceof Error ? err.message : "Password change failed";
        if (msg.toLowerCase().includes("current password")) {
          setCurrentError("The current password is incorrect.");
        } else {
          toast("error", msg);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  const ttlHours = info && typeof info.sessionTtlSeconds === "number" ? Math.round(info.sessionTtlSeconds / 3600) : 168;

  return (
    <>
      <PageHeader
        title="Security"
        description="Manage the password and sessions for your own account."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card title="Change password">
          <form onSubmit={changePassword} className="grid max-w-md gap-4">
            <Field label="Current password" htmlFor="currentPassword" error={currentError}>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                autoComplete="current-password"
                value={current}
                onChange={setCurrent}
                invalid={Boolean(currentError)}
              />
            </Field>
            <NewPasswordFields
              password={password}
              confirm={confirm}
              onPassword={setPassword}
              onConfirm={setConfirm}
              error={newError}
            />
            <div className="flex items-center gap-3 pt-1">
              <AdminButton
                type="submit"
                variant="primary"
                loading={saving}
                className="shrink-0 whitespace-nowrap"
              >
                <KeyRound className="size-3.5" aria-hidden /> Update password
              </AdminButton>
              <p className="text-ink-400 text-xs">
                Changing it signs out every other device; this one stays signed in.
              </p>
            </div>
          </form>
        </Card>

        <div className="grid content-start gap-6">
          <Card title="Account">
            {!info || !info.user ? (
              <div className="dash-shimmer h-24 rounded-lg" />
            ) : (
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-ink-400 text-xs">Signed in as</dt>
                  <dd className="text-ink-900 font-medium">{info.user.name || "Yaron Admin"}</dd>
                  <dd className="text-ink-500">{info.user.email || "admin@yaronengineering.com"}</dd>
                </div>
                <div>
                  <dt className="text-ink-400 text-xs">Role</dt>
                  <dd className="text-ink-900 font-mono text-xs tracking-[0.12em] uppercase">
                    {info.user.role || "ADMIN"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-400 text-xs">Password last changed</dt>
                  <dd className="text-ink-900">
                    {info.passwordChangedAt ? formatDate(info.passwordChangedAt) : "Never"}
                  </dd>
                </div>
              </dl>
            )}
          </Card>

          <Card title="Sessions">
            <ul className="text-ink-600 grid gap-3 text-sm">
              <li className="flex gap-3">
                <Clock className="text-ink-400 mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Sessions expire automatically after{" "}
                  {ttlHours === null ? "…" : `${ttlHours} hours`}; you&apos;ll be asked to sign in
                  again.
                </span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="text-ink-400 mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Lost a device? Change your password above to revoke its access immediately.
                </span>
              </li>
              {info && !info.resetEmailEnabled && (
                <li className="border-gold-500/40 bg-gold-500/15 text-gold-700 flex gap-3 rounded-md border px-3 py-2">
                  <MailWarning className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    Outgoing email is not configured on the server, so &ldquo;Forgot password&rdquo;
                    links are written to the API log instead of being emailed.
                  </span>
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
