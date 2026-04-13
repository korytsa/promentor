import { GoogleAuthButton } from "./GoogleAuthButton";

type AuthFormOAuthDividerProps = {
  googleLabel: string;
  onGoogleClick?: () => void;
  disabled?: boolean;
};

export function AuthFormOAuthDivider({
  googleLabel,
  onGoogleClick,
  disabled = false,
}: AuthFormOAuthDividerProps) {
  return (
    <>
      <GoogleAuthButton
        label={googleLabel}
        onClick={onGoogleClick}
        disabled={disabled}
      />
      <div
        className="flex items-center gap-3 text-xs pm-text-muted"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Or continue with email"
      >
        <span className="h-px flex-1 bg-[var(--pm-divider)]" aria-hidden />
        <span aria-hidden="true">OR</span>
        <span className="h-px flex-1 bg-[var(--pm-divider)]" aria-hidden />
      </div>
    </>
  );
}
