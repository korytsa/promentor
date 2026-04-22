export const MENTOR_FLOW = [
  "Create learning boards and structured weekly tasks",
  "Review submissions and leave practical, actionable feedback",
  "Support mentees with short sessions and progress checkpoints",
] as const;

export const USER_FLOW = [
  "Pick a mentor and start with a simple personal roadmap",
  "Complete weekly tasks and ask questions in chat",
  "Reflect on feedback and update your next-week plan",
] as const;

export const DASHBOARD_TAGS = [
  { label: "Clear Goals", tone: "cyan" },
  { label: "Weekly Progress", tone: "blue" },
  { label: "Actionable Feedback", tone: "cyan" },
] as const;

export const DASHBOARD_STATS = [
  {
    label: "Teams",
    metric: "teams",
    helper: "Active learning squads",
    tone: "cyan",
  },
  {
    label: "Mentors",
    metric: "mentors",
    helper: "Mentor accounts",
    tone: "blue",
  },
  {
    label: "Interns",
    metric: "interns",
    helper: "Learner accounts",
    tone: "cyan",
  },
  {
    label: "Boards",
    metric: "boards",
    helper: "Active tactical boards",
    tone: "blue",
  },
] as const;

export const SECTION_CARD_BASE =
  "rounded-lg border border-[var(--pm-accent-cyan-border)] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.18)]";

export const TONE_STYLES = {
  cyan: {
    border: "border-[var(--pm-accent-cyan-border)]",
    text: "text-[var(--pm-accent-cyan)]",
  },
  blue: {
    border: "border-[var(--pm-accent-blue-border)]",
    text: "text-[var(--pm-accent-blue)]",
  },
} as const;

export type Tone = keyof typeof TONE_STYLES;
