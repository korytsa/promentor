import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const OAUTH_FAILED_MESSAGE =
  "Google sign-in didn't complete. Try again or continue with email.";

export function useOauthFailedSearchParam(): string | null {
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("oauth") !== "failed") {
      return;
    }
    setMessage(OAUTH_FAILED_MESSAGE);
    const next = new URLSearchParams(searchParams);
    next.delete("oauth");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return message;
}
