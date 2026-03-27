import { Button } from "@promentorapp/ui-kit";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  onClick: () => void;
  label?: string;
}

export const GoogleAuthButton = ({
  onClick,
  label = "Continue with Google",
}: GoogleAuthButtonProps) => {
  return (
    <Button
      type="button"
      customVariant="authGlass"
      onClick={onClick}
      fullWidth={true}
    >
      <FcGoogle size={18} aria-hidden="true" className="shrink-0" />
      {label}
    </Button>
  );
};
