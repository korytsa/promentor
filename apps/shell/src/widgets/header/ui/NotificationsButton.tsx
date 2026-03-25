import { Bell } from "lucide-react";
import { Button } from "@promentorapp/ui-kit";

export interface NotificationsButtonProps {
  hasUnread?: boolean;
  onClick?: () => void;
}

export const NotificationsButton = ({
  hasUnread = true,
  onClick,
}: NotificationsButtonProps) => {
  return (
    <Button
      isIconOnly
      customVariant="ghost"
      aria-label="Notifications"
      onClick={onClick}
    >
      <span className="relative inline-flex">
        <Bell className="size-6" />
        {hasUnread && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </span>
    </Button>
  );
};
