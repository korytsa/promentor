import { MENTOR_FLOW, QUICK_ACTIONS, USER_FLOW } from "@/entities/dashboard";
import { useSessionQuery } from "@/features/auth/api";
import { Typography } from "@promentorapp/ui-kit";

export const DashboardPage = () => {
  const { data: user } = useSessionQuery();
  const isMentor = user?.role === "MENTOR";

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-950/10 p-8 md:p-10 shadow-[0_20px_80px_rgba(6,182,212,0.12)]">
        <Typography variantStyle="title" className="text-3xl md:text-4xl">
          {isMentor
            ? "Guide learners with clarity and consistency"
            : "Learn faster with focused mentorship"}
        </Typography>
        <Typography
          variantStyle="body"
          className="mt-4 max-w-3xl leading-relaxed text-slate-400"
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
            className={`rounded-2xl p-5
               ${index % 2 === 0 ? "border border-cyan-400/20 bg-cyan-500/5" : "border border-blue-400/20 bg-blue-500/5"}`}
          >
            <Typography
              component="h2"
              className="text-lg font-semibold text-slate-100"
            >
              {item.title}
            </Typography>
            <Typography
              variantStyle="body"
              className="mt-2 text-sm leading-relaxed text-slate-400"
            >
              {item.description}
            </Typography>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-6">
          <Typography
            component="h2"
            className="text-xl font-semibold text-cyan-200"
          >
            For Mentors
          </Typography>
          <ul className="mt-4 space-y-3 text-slate-400">
            {MENTOR_FLOW.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-6">
          <Typography
            component="h2"
            className="text-xl font-semibold text-blue-200"
          >
            For Regular Users
          </Typography>
          <ul className="mt-4 space-y-3 text-slate-400">
            {USER_FLOW.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};
