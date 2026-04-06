import { Button } from "@promentorapp/ui-kit";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const GoogleAuthButton = ({
  label = "Continue with Google",
  onClick,
  disabled = false,
}: GoogleAuthButtonProps) => {
  return (
    <Button
      type="button"
      fullWidth={true}
      customVariant="surface"
      onClick={onClick}
      disabled={disabled}
      sx={{
        minHeight: "45px",
      }}
    >
      <FcGoogle size={18} aria-hidden="true" className="shrink-0" />
      {label}
    </Button>
  );
};
