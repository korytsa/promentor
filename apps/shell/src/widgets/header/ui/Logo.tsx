import { Link } from "react-router-dom";

export const Logo = () => (
  <Link
    to="/"
    className="text-2xl font-black tracking-tighter text-slate-400 uppercase no-underline"
  >
    Pro<span className="text-blue-500">Mentor</span>
  </Link>
);
