import {
  Avatar as MuiAvatar,
  type AvatarProps as MuiAvatarProps,
  styled,
} from "@mui/material";

export interface AvatarProps extends MuiAvatarProps {
  size?: "sm" | "md" | "lg";
}

const StyledAvatar = styled(MuiAvatar, {
  shouldForwardProp: (prop) => prop !== "size",
})<AvatarProps>(({ size }) => ({
  ...(size === "sm" && {
    width: 28,
    height: 28,
  }),
  ...(size === "md" && {
    width: 36,
    height: 36,
  }),
  ...(size === "lg" && {
    width: 48,
    height: 48,
  }),
}));

export const Avatar = ({ size, ...props }: AvatarProps) => {
  return <StyledAvatar size={size} {...props} />;
};
