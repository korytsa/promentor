import {
  Box,
  CircularProgress,
  type CircularProgressProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";
import { Typography } from "../Typography";

export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps extends Omit<CircularProgressProps, "size"> {
  size?: LoaderSize;
  label?: ReactNode;
  centered?: boolean;
  fullScreen?: boolean;
  containerSx?: SxProps<Theme>;
}

const sizeMap: Record<LoaderSize, number> = {
  sm: 18,
  md: 28,
  lg: 40,
};

export const Loader = ({
  size = "md",
  label,
  centered = true,
  fullScreen = false,
  containerSx,
  color = "primary",
  thickness = 4,
  ...props
}: LoaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: centered ? "center" : "flex-start",
        gap: 1.25,
        width: "100%",
        minHeight: fullScreen ? "100vh" : undefined,
        ...containerSx,
      }}
    >
      <CircularProgress
        color={color}
        size={sizeMap[size]}
        thickness={thickness}
        aria-label={typeof label === "string" ? label : "Loading"}
        {...props}
      />
      {label ? (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      ) : null}
    </Box>
  );
};
