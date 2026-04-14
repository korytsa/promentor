import { MENTOR_FLOW, QUICK_ACTIONS, USER_FLOW } from "@/entities/dashboard";
import { useSessionQuery } from "@/features/auth/api";
import { Typography } from "@promentorapp/ui-kit";

export const DashboardPage = () => {
  const { data: user } = useSessionQuery();
  const isMentor = user?.role === "MENTOR";

  return (
    <section className="space-y-6">
      <div className="rounded-lg border pm-border [background-color:var(--pm-accent-blue-soft)] p-8 shadow-[0_20px_80px_rgba(6,182,212,0.12)] md:p-10">
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
          className="mt-4 max-w-3xl leading-relaxed pm-text-secondary"
        >
          ProMentor connects mentors and learners in one practical workflow:
          define goals, work through structured tasks, and improve with ongoing
          feedback.
        </Typography>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((item, index) => (
          <article
            key={item.title}
            className={`rounded-lg p-5 ${index % 2 === 0 ? "border [border-color:var(--pm-accent-cyan-border)] [background-color:var(--pm-accent-cyan-soft)]" : "border [border-color:var(--pm-accent-blue-border)] [background-color:var(--pm-accent-blue-soft)]"}`}
          >
            <Typography
              component="h2"
              className="text-lg font-semibold pm-text-primary"
            >
              {item.title}
            </Typography>
            <Typography
              variantStyle="body"
              className="mt-2 text-sm leading-relaxed pm-text-secondary"
            >
              {item.description}
            </Typography>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border p-6 [border-color:var(--pm-accent-cyan-border)] [background-color:var(--pm-accent-cyan-soft)]">
          <Typography
            component="h2"
            className="text-xl font-semibold text-[var(--pm-accent-cyan)]"
          >
            For Mentors
          </Typography>
          <ul className="mt-4 space-y-3 pm-text-secondary">
            {MENTOR_FLOW.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--pm-dot-cyan)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border p-6 [border-color:var(--pm-accent-blue-border)] [background-color:var(--pm-accent-blue-soft)]">
          <Typography
            component="h2"
            className="text-xl font-semibold text-[var(--pm-accent-blue)]"
          >
            For Regular Users
          </Typography>
          <ul className="mt-4 space-y-3 pm-text-secondary">
            {USER_FLOW.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--pm-dot-blue)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};
