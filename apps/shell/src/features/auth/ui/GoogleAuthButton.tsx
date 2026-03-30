import { Button } from "@promentorapp/ui-kit";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  label?: string;
}

export const GoogleAuthButton = ({
  label = "Continue with Google",
}: GoogleAuthButtonProps) => {
  const comingSoonLabel = `${label} (Coming soon)`;

  return (
    <Button
      type="button"
      customVariant="authGlass"
      disabled={true}
      fullWidth={true}
      aria-label={comingSoonLabel}
      title="Google authentication is coming soon"
      sx={{
        color: "var(--pm-text-secondary)",
        border: "1px solid var(--pm-border)",
        backgroundColor: "var(--pm-surface)",
      }}
    >
      <FcGoogle size={18} aria-hidden="true" className="shrink-0" />
      {comingSoonLabel}
    </Button>
  );
};
