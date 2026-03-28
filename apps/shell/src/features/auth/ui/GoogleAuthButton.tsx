import { Button } from "@promentorapp/ui-kit";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  label?: string;
}

export const GoogleAuthButton = ({
  label = "Continue with Google",
}: GoogleAuthButtonProps) => {
  return (
    <Button
      type="button"
      customVariant="authGlass"
      onClick={() => {}}
      fullWidth={true}
      aria-label={`${label} (coming soon)`}
    >
      <FcGoogle size={18} aria-hidden="true" className="shrink-0" />
      {label}
    </Button>
  );
};
