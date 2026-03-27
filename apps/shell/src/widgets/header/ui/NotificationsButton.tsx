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
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </span>
        </Button>
      )}
    >
      {({ closeMenu }) => (
        <div className="flex flex-col">
          <div className="p-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Notifications
          </div>
          <div className="border-t border-slate-200 dark:border-white/5" />
          <div className="flex flex-col gap-y-1">
            <Link
              to="/notifications"
              onClick={closeMenu}
              className="w-full text-left flex flex-col gap-y-1 px-2 py-2 rounded-lg transition-all text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5"
            >
              <span className="font-medium">New notification!</span>
              <span className="text-xs text-slate-500">
                Training plan has been updated.
              </span>
            </Link>
          </div>
        </div>
      )}
    </DropdownMenu>
  );
};
