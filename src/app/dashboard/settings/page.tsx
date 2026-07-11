"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
  customerCount: number;
  invoiceCount: number;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setUser(data?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function startEditProfile() {
    if (!user) return;
    setProfileForm({ name: user.name, email: user.email });
    setEditingProfile(true);
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });

    if (res.ok) {
      const data = await res.json();
      setUser((prev) => (prev ? { ...prev, ...data.user } : prev));
      setEditingProfile(false);
      toast("Profile updated");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Failed to update profile", "error");
    }
    setSavingProfile(false);
  }

  async function handleChangePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast("New passwords do not match", "error");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast("Password must be at least 8 characters", "error");
      return;
    }

    setSavingPassword(true);
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    });

    if (res.ok) {
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Password changed successfully");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Failed to change password", "error");
    }
    setSavingPassword(false);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Workspace configuration
          </p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass animate-pulse rounded-2xl p-6">
              <div className="h-3 w-24 rounded bg-[var(--surface-elevated)]" />
              <div className="mt-3 h-6 w-40 rounded bg-[var(--surface-elevated)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Workspace configuration
          </p>
        </div>
      </div>

      {user ? (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Profile
              </h2>
              {!editingProfile && (
                <button
                  onClick={startEditProfile}
                  className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Edit
                </button>
              )}
            </div>

            {editingProfile ? (
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                    style={{ transform: "rotate(-12deg)" }}
                  >
                    {initialsFor(profileForm.name)}
                  </div>
                  <Badge variant={user.role === "ADMIN" ? "paid" : "draft"}>
                    {user.role}
                  </Badge>
                </div>
                <Input
                  label="Name"
                  value={profileForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfileForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfileForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} loading={savingProfile}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                    style={{ transform: "rotate(-12deg)" }}
                  >
                    {initialsFor(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant={user.role === "ADMIN" ? "paid" : "draft"}>
                    {user.role}
                  </Badge>
                </div>

                <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-700/50">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Member since
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                      {formatJoinedDate(user.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Account ID
                    </dt>
                    <dd className="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      {user.id}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* Password Card */}
          <div className="glass rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </h2>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Change
                </button>
              )}
            </div>

            {showPasswordForm ? (
              <div className="pt-4 space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                  }
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleChangePassword} loading={savingPassword}>
                    Update Password
                  </Button>
                </div>
              </div>
            ) : (
              <p className="pt-3 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Last changed — update regularly for security.
              </p>
            )}
          </div>

          {/* Workspace Card */}
          <div className="glass rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 dark:text-slate-400 dark:border-slate-700/50">
              Workspace
            </h2>
            <p className="pt-3 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Plan, role, and activity access at a glance.
            </p>

            <dl className="mt-4 divide-y divide-slate-100 dark:divide-slate-700/50">
              {[
                { label: "Plan", value: "Free" },
                { label: "Your role", value: user.role },
                { label: "Activity log access", value: user.role === "ADMIN" ? "Full access" : "View only" },
                { label: "Customers in workspace", value: String(user.customerCount) },
                { label: "Invoices issued", value: String(user.invoiceCount) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <dt className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Unable to load your account. Sign out and back in to retry.
          </p>
        </div>
      )}
    </div>
  );
}
