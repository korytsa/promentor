import { Link } from "react-router-dom";

export type AvatarUser = {
  name: string;
  avatarUrl?: string | null;
};

export type AvatarProps = {
  user: AvatarUser;
  size: "sm" | "md" | "lg";
  href?: string;
};

const sizeClassName: Record<AvatarProps["size"], string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
};

function getInitial(name: string): string {
  const normalized = name.trim();
  if (!normalized) {
    return "U";
  }
  return normalized.charAt(0).toUpperCase();
}

function AvatarContent({ user, size }: Pick<AvatarProps, "user" | "size">) {
  const commonClassName = [
    "grid shrink-0 place-items-center overflow-hidden rounded-full border pm-border font-semibold pm-text-primary",
    sizeClassName[size],
  ].join(" ");

  if (!user.avatarUrl) {
    return <span className={commonClassName}>{getInitial(user.name)}</span>;
  }

  return (
    <img
      src={user.avatarUrl}
      alt={user.name}
      className={`${commonClassName} object-cover`}
    />
  );
}

export function Avatar({ user, size, href }: AvatarProps) {
  if (href) {
    return (
      <Link
        to={href}
        aria-label={`${user.name} profile`}
        className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a6de5]"
      >
        <AvatarContent user={user} size={size} />
      </Link>
    );
  }

  return <AvatarContent user={user} size={size} />;
}
