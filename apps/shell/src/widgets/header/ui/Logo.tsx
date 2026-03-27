import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link
      to="/"
      className="text-2xl font-black tracking-tighter uppercase no-underline transition-colors text-slate-600 dark:text-slate-400"
    >
      Pro<span className="text-blue-500">Mentor</span>
    </Link>
  );
};
