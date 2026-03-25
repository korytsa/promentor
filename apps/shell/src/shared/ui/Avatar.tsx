import { cn } from "@/shared/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-12 h-12",
};

const fontSizes = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export const Avatar = ({
  src,
  alt = "Avatar",
  size = "md",
  className,
}: AvatarProps) => {
  return (
    <div
      className={cn(
        "rounded-full border border-white/10 group-hover:border-blue-500/50 transition-all select-none overflow-hidden bg-slate-800 flex items-center justify-center shrink-0",
        sizes[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center text-slate-500 uppercase font-bold",
            fontSizes[size],
          )}
        >
          {alt?.charAt(0) || "U"}
        </div>
      )}
    </div>
  );
};
