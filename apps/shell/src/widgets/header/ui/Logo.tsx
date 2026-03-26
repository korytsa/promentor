import { Link } from "react-router-dom";
import { useAppTheme } from "@promentorapp/ui-kit";
import { cn } from "@/shared/lib/utils";

export const Logo = () => {
  const { mode } = useAppTheme();

  return (
    <Link
      to="/"
      className={cn(
        "text-2xl font-black tracking-tighter uppercase no-underline transition-colors",
        mode === "dark" ? "text-slate-400" : "text-slate-600",
      )}
    >
      Pro<span className="text-blue-500">Mentor</span>
    </Link>
  );
};
