import { MENTOR_FLOW, USER_FLOW } from "@/entities/dashboard";
import { useSessionQuery } from "@/features/auth/api";
import { Typography } from "@promentorapp/ui-kit";
import {
  DASHBOARD_STATS,
  DASHBOARD_TAGS,
  MOMENTUM_SNAPSHOT,
  SECTION_CARD_BASE,
  SNAPSHOT_TILE_BASE,
  TONE_STYLES,
  type Tone,
  WEEKLY_FOCUS,
} from "../model/constants";

const SnapshotTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: Tone;
}) => (
  <div
    className={`${SNAPSHOT_TILE_BASE} ${TONE_STYLES[tone].border} ${TONE_STYLES[tone].tileBg}`}
  >
    <Typography
      component="p"
      className="text-xs uppercase tracking-wide pm-text-secondary"
    >
      {label}
    </Typography>
    <Typography
      component="p"
      className="mt-2 text-2xl font-bold pm-text-primary"
    >
      {value}
    </Typography>
  </div>
);

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
            className={`rounded-lg border bg-[rgba(6,30,46,0.45)] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-colors duration-200 ${`${TONE_STYLES[stat.tone].border} ${TONE_STYLES[stat.tone].hover}`}`}
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
              {stat.value}
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

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article
          className={`${SECTION_CARD_BASE} bg-[linear-gradient(180deg,rgba(8,145,178,0.16),rgba(15,23,42,0.34))]`}
        >
          <Typography
            component="h3"
            className="text-lg font-semibold pm-text-primary"
          >
            This Week Focus
          </Typography>
          <Typography variantStyle="body" className="mt-1 pm-text-secondary">
            Priorities that keep teams and mentors aligned this sprint.
          </Typography>

          <div className="mt-5 space-y-4">
            {WEEKLY_FOCUS.map((item) => (
              <div key={item.title} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Typography
                    component="p"
                    className="text-sm font-medium pm-text-primary"
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    component="span"
                    className="text-xs uppercase tracking-wide pm-text-secondary"
                  >
                    {item.progress}%
                  </Typography>
                </div>
                <div className="h-2 overflow-hidden rounded-lg bg-[rgba(148,163,184,0.20)]">
                  <div
                    className="h-full rounded-lg bg-[linear-gradient(90deg,var(--pm-accent-cyan),var(--pm-accent-blue))]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <Typography component="p" className="text-xs pm-text-secondary">
                  Owner: {item.owner}
                </Typography>
              </div>
            ))}
          </div>
        </article>

        <article
          className={`${SECTION_CARD_BASE} bg-[linear-gradient(180deg,rgba(8,145,178,0.12),rgba(15,23,42,0.34))]`}
        >
          <Typography
            component="h3"
            className="text-lg font-semibold text-[var(--pm-accent-blue)]"
          >
            Momentum Snapshot
          </Typography>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {MOMENTUM_SNAPSHOT.map((item) => (
              <SnapshotTile
                key={item.label}
                label={item.label}
                value={item.value}
                tone={item.tone}
              />
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FlowCard title="For Mentors" tone="cyan" items={MENTOR_FLOW} />
        <FlowCard title="For Regular Users" tone="blue" items={USER_FLOW} />
      </div>
    </section>
  );
};
