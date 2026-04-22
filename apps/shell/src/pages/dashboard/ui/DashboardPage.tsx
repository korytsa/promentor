import {
  DASHBOARD_STATS,
  DASHBOARD_TAGS,
  MENTOR_FLOW,
  SECTION_CARD_BASE,
  TONE_STYLES,
  type Tone,
  USER_FLOW,
} from "@/entities/dashboard";
import { useSessionQuery } from "@/features/auth/api";
import { useDashboardMetricsQuery } from "@/features/dashboard/api/useDashboardMetricsQuery";
import { Typography } from "@promentorapp/ui-kit";

const FlowCard = ({
  title,
  tone,
  items,
}: {
  title: string;
  tone: Tone;
  items: readonly string[];
}) => (
  <article
    className={`${SECTION_CARD_BASE} bg-[linear-gradient(180deg,rgba(8,145,178,0.12),rgba(15,23,42,0.34))]`}
  >
    <Typography
      component="h2"
      className={`text-xl font-semibold ${TONE_STYLES[tone].text}`}
    >
      {title}
    </Typography>
    <ul className="mt-4 space-y-3 pm-text-secondary">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className={`mt-1 h-2 w-2 rounded-lg ${TONE_STYLES[tone].text.replace("text", "bg")}`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </article>
);

export const DashboardPage = () => {
  const { data: user } = useSessionQuery();
  const { data: metrics, isPending, isError } = useDashboardMetricsQuery();
  const isMentor = user?.role === "MENTOR";

  return (
    <section className="space-y-6 p-4 lg:p-0">
      <div className="rounded-lg border border-[var(--pm-accent-cyan-border)] bg-[linear-gradient(180deg,rgba(8,145,178,0.14),rgba(30,64,175,0.08))] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.22)]">
        <div className="relative z-10 max-w-4xl space-y-4">
          <Typography
            variantStyle="title"
            className="text-3xl md:text-4xl pm-text-primary"
          >
            {isMentor
              ? "Guide learners with clarity and consistency"
              : "Learn faster with focused mentorship"}
          </Typography>
          <Typography
            variantStyle="body"
            className="max-w-3xl leading-relaxed pm-text-secondary"
          >
            ProMentor connects mentors and learners in one practical workflow:
            define goals, work through structured tasks, and improve with
            ongoing feedback.
          </Typography>

          <div className="flex flex-wrap gap-2 pt-2">
            {DASHBOARD_TAGS.map((tag) => (
              <span
                key={tag.label}
                className={`rounded-lg border bg-[rgba(15,23,42,0.30)] px-3 py-1 text-xs font-semibold uppercase tracking-widest ${TONE_STYLES[tag.tone].border} ${TONE_STYLES[tag.tone].text}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_STATS.map((stat) => (
          <article
            key={stat.label}
            className={`rounded-lg border bg-[rgba(6,30,46,0.45)] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.18)] ${TONE_STYLES[stat.tone].border}`}
          >
            <Typography
              component="h3"
              className="text-xs font-semibold uppercase tracking-widest pm-text-secondary"
            >
              {stat.label}
            </Typography>
            <Typography
              component="p"
              className={`mt-3 text-4xl font-black leading-none ${TONE_STYLES[stat.tone].text}`}
            >
              {isPending
                ? "…"
                : isError || metrics == null
                  ? "—"
                  : String(metrics[stat.metric])}
            </Typography>
            <Typography
              variantStyle="body"
              className="mt-2 text-sm pm-text-secondary"
            >
              {stat.helper}
            </Typography>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FlowCard title="For Mentors" tone="cyan" items={MENTOR_FLOW} />
        <FlowCard title="For Regular Users" tone="blue" items={USER_FLOW} />
      </div>
    </section>
  );
};
