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
      disabled={true}
      fullWidth={true}
      customVariant="surface"
      aria-label={comingSoonLabel}
      sx={{
        minHeight: "40px",
      }}
    >
      <FcGoogle size={18} aria-hidden="true" className="shrink-0" />
      {comingSoonLabel}
    </Button>
  );
};
