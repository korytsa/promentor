import type { UserRole } from "@promentor/types";
import { Box, Typography } from "@promentor/ui-kit";

export function App() {
  const role: UserRole = "user";
  return (
    <Box className="flex min-h-dvh flex-col gap-2 p-4" data-user-role={role}>
      <Typography variant="h4" component="h1">
        ProMentor Shell
      </Typography>
      <p className="text-sm text-gray-600">
        MUI + Tailwind (preflight off, CssBaseline from MUI).
      </p>
    </Box>
  );
}
