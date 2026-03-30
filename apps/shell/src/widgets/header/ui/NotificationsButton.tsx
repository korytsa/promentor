import { Bell } from "lucide-react";
import { Button } from "@promentorapp/ui-kit";
import { DropdownMenu } from "@/shared/ui/DropdownMenu";
import { Link } from "react-router-dom";

export interface NotificationsButtonProps {
  hasUnread?: boolean;
}

export const NotificationsButton = ({
  hasUnread = true,
}: NotificationsButtonProps) => {
  return (
    <DropdownMenu
      id="notifications-menu"
      containerClassName="relative flex items-center gap-x-4"
      trigger={({ isOpen, onToggle, triggerRef }) => (
        <Button
          ref={triggerRef}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls="notifications-menu"
          aria-label="Notifications menu"
          isIconOnly
          customVariant="ghost"
        >
          <span className="relative inline-flex">
            <Bell className="size-6" />
            {hasUnread && (
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[var(--pm-accent-blue)]" />
            )}
          </span>
        </Button>
      )}
    >
      {({ closeMenu }) => (
        <div className="flex flex-col">
          <div className="p-2 text-sm font-semibold pm-text-secondary">
            Notifications
          </div>
          <div className="border-t border-[var(--pm-divider)]" />
          <div className="flex flex-col gap-y-1">
            <Link
              to="/notifications"
              onClick={closeMenu}
              className="flex w-full flex-col gap-y-1 rounded-lg px-2 py-2 text-left text-sm transition-all pm-text-secondary hover:pm-text-primary hover:bg-[var(--pm-surface-hover)]"
            >
              <span className="font-medium">New notification!</span>
              <span className="text-xs pm-text-muted">
                Training plan has been updated.
              </span>
            </Link>
          </div>
        </div>
      )}
    </DropdownMenu>
  );
};
