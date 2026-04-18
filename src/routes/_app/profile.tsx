import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Moon, Sun, Bell, BellOff, Download, Shield, ChevronRight, LogOut, Palette, Pencil, Check, X,
} from "lucide-react";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — MoodMap" },
      { name: "description", content: "Manage your profile, preferences, privacy settings, and data exports." },
      { property: "og:title", content: "Profile — MoodMap" },
      { property: "og:description", content: "Your profile and settings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { entries } = useMoodEntries();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    const savedNotif = localStorage.getItem("moodmap_notifications");
    if (savedNotif !== null) setNotifications(savedNotif === "true");
    const savedTime = localStorage.getItem("moodmap_reminder_time");
    if (savedTime) setReminderTime(savedTime);
  }, [hydrated]);

  useEffect(() => {
    setNameDraft(profile?.display_name ?? "");
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const saveDisplayName = async () => {
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: nameDraft.trim() || null })
      .eq("user_id", user.id);
    setSavingName(false);
    if (error) {
      toast.error("Failed to update name");
      return;
    }
    await refreshProfile();
    setEditingName(false);
    toast.success("Display name updated");
  };

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    document.documentElement.classList.toggle("dark", newVal);
    localStorage.setItem("moodmap_darkmode", String(newVal));
    toast.success(newVal ? "Dark mode enabled 🌙" : "Light mode enabled ☀️");
  };

  const toggleNotifications = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    localStorage.setItem("moodmap_notifications", String(newVal));
    toast.success(newVal ? "Reminders enabled" : "Reminders disabled");
  };

  const handleExportJSON = () => {
    if (!hydrated) return;
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moodmap-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported as JSON");
  };

  const handleExportCSV = () => {
    if (!hydrated) return;
    const header = "Date,Mood,Journal,Tags\n";
    const rows = entries
      .map((e) => `${e.date},${e.mood},"${e.journal.replace(/"/g, '""')}","${e.tags.join(", ")}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moodmap-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported as CSV");
  };

  const totalEntries = hydrated ? entries.length : 0;
  const streak = hydrated ? calculateStreak(entries.map((e) => e.date)) : 0;

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your account and settings</p>
      </motion.div>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border bg-card p-5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-7 w-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-8 flex-1 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Display name"
                  autoFocus
                />
                <button
                  onClick={saveDisplayName}
                  disabled={savingName}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                  aria-label="Save name"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setEditingName(false); setNameDraft(profile?.display_name ?? ""); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-foreground"
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-semibold text-foreground truncate">
                  {profile?.display_name || user?.email?.split("@")[0] || "MoodMap User"}
                </h3>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Edit name"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-lg font-bold text-foreground">{totalEntries}</p>
            <p className="text-[10px] text-muted-foreground">Total Entries</p>
          </div>
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-lg font-bold text-foreground">{streak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak 🔥</p>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <Section title="Appearance" delay={0.1}>
        <SettingRow
          icon={darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          label="Dark Mode"
          description="Switch between light and dark themes"
          action={
            <button
              onClick={toggleDarkMode}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                darkMode ? "bg-primary" : "bg-muted"
              )}
              aria-label="Toggle dark mode"
            >
              <motion.div
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
                animate={{ left: darkMode ? "calc(100% - 1.625rem)" : "0.125rem" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          }
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" delay={0.15}>
        <SettingRow
          icon={notifications ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          label="Daily Reminders"
          description="Get reminded to log your mood"
          action={
            <button
              onClick={toggleNotifications}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                notifications ? "bg-primary" : "bg-muted"
              )}
              aria-label="Toggle notifications"
            >
              <motion.div
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
                animate={{ left: notifications ? "calc(100% - 1.625rem)" : "0.125rem" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          }
        />
        {notifications && (
          <SettingRow
            icon={<Palette className="h-5 w-5" />}
            label="Reminder Time"
            description="When to send the daily reminder"
            action={
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => handleReminderTimeChange(e.target.value)}
                className="rounded-lg border bg-background px-2 py-1 text-xs text-foreground"
              />
            }
          />
        )}
      </Section>

      {/* Data & Privacy */}
      <Section title="Data & Privacy" delay={0.2}>
        <SettingRow
          icon={<Download className="h-5 w-5" />}
          label="Export as JSON"
          description="Download all your mood data"
          action={
            <button onClick={handleExportJSON} className="text-xs font-medium text-primary">
              Export
            </button>
          }
        />
        <SettingRow
          icon={<Download className="h-5 w-5" />}
          label="Export as CSV"
          description="Spreadsheet-compatible format"
          action={
            <button onClick={handleExportCSV} className="text-xs font-medium text-primary">
              Export
            </button>
          }
        />
        <SettingRow
          icon={<Shield className="h-5 w-5" />}
          label="Privacy"
          description="Your data is encrypted and synced to your account"
          action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
        />
      </Section>

      {/* Account */}
      <Section title="Account" delay={0.23}>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
        >
          <div className="text-destructive"><LogOut className="h-5 w-5" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">Sign Out</p>
            <p className="text-[11px] text-muted-foreground">End your current session</p>
          </div>
        </button>
      </Section>

      {/* About */}
      <Section title="About" delay={0.25}>
        <div className="px-4 py-3">
          <p className="text-sm text-foreground font-medium">MoodMap</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0 · Phase 6</p>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            AI-powered mood tracking with visual insights, personalized recommendations, and self-care resources.
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="divide-y rounded-2xl border bg-card">{children}</div>
    </motion.div>
  );
}

function SettingRow({
  icon,
  label,
  description,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  if (sorted[0] !== today) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    prev.setDate(prev.getDate() - 1);
    if (prev.toISOString().split("T")[0] === sorted[i]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
