import { GoogleAuthButton } from "./GoogleAuthButton";

type AuthFormOAuthDividerProps = {
  googleLabel: string;
};

export function AuthFormOAuthDivider({
  googleLabel,
}: AuthFormOAuthDividerProps) {
  return (
    <>
      <GoogleAuthButton label={googleLabel} />
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        OR
        <span className="h-px flex-1 bg-white/10" />
      </div>
    </>
  );
}
