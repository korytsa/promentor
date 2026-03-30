import { Typography } from "@promentorapp/ui-kit";

type AuthFormServerErrorProps = {
  message: string | false | null | undefined;
};

export function AuthFormServerError({ message }: AuthFormServerErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <Typography
      component="p"
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
    >
      {message}
    </Typography>
  );
}
