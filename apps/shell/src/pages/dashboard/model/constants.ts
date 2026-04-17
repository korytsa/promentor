export const DASHBOARD_TAGS = [
  { label: "Clear Goals", tone: "cyan" },
  { label: "Weekly Progress", tone: "blue" },
  { label: "Actionable Feedback", tone: "cyan" },
] as const;

export const DASHBOARD_STATS = [
  {
    label: "Teams",
    value: "3",
    helper: "Active learning squads",
    tone: "cyan",
  },
  {
    label: "Mentors",
    value: "10",
    helper: "Available this week",
    tone: "blue",
  },
  {
    label: "Tasks Completed",
    value: "42",
    helper: "Across current cycle",
    tone: "cyan",
  },
  {
    label: "Weekly Check-ins",
    value: "18",
    helper: "Submitted progress logs",
    tone: "blue",
  },
] as const;

export const WEEKLY_FOCUS = [
  { title: "Team onboarding calls", progress: 85, owner: "Mentor Ops" },
  { title: "Task review quality check", progress: 68, owner: "Lead Mentor" },
  { title: "Learner weekly feedback", progress: 92, owner: "Community" },
] as const;

export const MOMENTUM_SNAPSHOT = [
  { label: "Avg. Team Score", value: "8.7", tone: "blue" },
  { label: "Active Threads", value: "24", tone: "cyan" },
  { label: "Sessions Today", value: "6", tone: "blue" },
  { label: "Goal Completion", value: "76%", tone: "cyan" },
] as const;

export const SECTION_CARD_BASE =
  "rounded-lg border border-[var(--pm-accent-cyan-border)] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.18)]";

export const SNAPSHOT_TILE_BASE = "rounded-lg border p-3";

export const TONE_STYLES = {
  cyan: {
    border: "border-[var(--pm-accent-cyan-border)]",
    text: "text-[var(--pm-accent-cyan)]",
    hover: "hover:bg-[rgba(8,145,178,0.16)]",
    tileBg: "bg-[rgba(8,145,178,0.14)]",
  },
  blue: {
    border: "border-[var(--pm-accent-blue-border)]",
    text: "text-[var(--pm-accent-blue)]",
    hover: "hover:bg-[rgba(30,64,175,0.16)]",
    tileBg: "bg-[rgba(30,64,175,0.14)]",
  },
} as const;

export type Tone = keyof typeof TONE_STYLES;
