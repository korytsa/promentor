import { UserRole } from "@/entities/user/types";
import { Typography } from "@promentorapp/ui-kit";

interface DashboardPageProps {
  role: UserRole;
}

const quickActions = [
  {
    title: "Set your learning goal",
    description:
      "Choose one clear goal for this week so your progress can be measured easily.",
  },
  {
    title: "Join a focused team",
    description:
      "Collaborate with peers around the same topic to stay motivated and accountable.",
  },
  {
    title: "Track outcomes",
    description:
      "See practical improvements from tasks, feedback sessions, and weekly check-ins.",
  },
];

const mentorFlow = [
  "Create learning boards and structured weekly tasks",
  "Review submissions and leave practical, actionable feedback",
  "Support mentees with short sessions and progress checkpoints",
];

const userFlow = [
  "Pick a mentor and start with a simple personal roadmap",
  "Complete weekly tasks and ask questions in chat",
  "Reflect on feedback and update your next-week plan",
];

export const DashboardPage = ({ role }: DashboardPageProps) => {
  const isMentor = role === "MENTOR";

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
          className="mt-4 max-w-3xl leading-relaxed"
        >
          ProMentor connects mentors and learners in one practical workflow:
          define goals, work through structured tasks, and improve with ongoing
          feedback.
        </Typography>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((item, index) => (
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
              className="mt-2 text-sm leading-relaxed text-slate-300"
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
          <ul className="mt-4 space-y-3 text-slate-200">
            {mentorFlow.map((item) => (
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
          <ul className="mt-4 space-y-3 text-slate-200">
            {userFlow.map((item) => (
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
