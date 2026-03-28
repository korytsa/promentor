import { useRef } from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Button, Typography, Avatar } from "@promentorapp/ui-kit";
import type { User } from "@/entities/user/types";
import { DropdownMenu } from "@/shared/ui/DropdownMenu";

interface UserMenuProps {
  user: User;
  onLogout?: () => void;
}

const MENU_LINKS = [
  { to: "/profile", icon: UserIcon, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);

  return (
    <DropdownMenu
      id="user-menu"
      containerClassName="relative flex items-center gap-x-4"
      firstMenuItemRef={firstMenuItemRef}
      trigger={({ isOpen, onToggle, triggerRef }) => (
        <Button
          ref={triggerRef}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls="user-menu"
          aria-label="User menu"
          customVariant="menuTrigger"
        >
          <div className="hidden md:flex flex-col gap-1 text-right">
            <Typography
              component="p"
              className="text-[10px] font-black tracking-widest uppercase pm-text-muted"
            >
              Welcome,
            </Typography>
            <Typography
              component="h2"
              className="user-menu-trigger-title text-xs uppercase font-bold transition-colors pm-text-secondary"
            >
              {user.fullName}
            </Typography>
          </div>

          <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
        </Button>
      )}
    >
      {({ closeMenu }) => (
        <>
          <div className="mb-2 border-b border-[var(--pm-divider)] px-3 py-2">
            <Typography
              component="p"
              className="mb-1 text-[10px] font-bold uppercase pm-text-muted"
            >
              Signed in as
            </Typography>
            <Typography
              component="p"
              className="text-sm font-medium truncate pm-text-primary"
            >
              {user.email}
            </Typography>
          </div>

          {MENU_LINKS.map(({ to, icon: Icon, label }, index) => (
            <Link
              key={to}
              ref={index === 0 ? firstMenuItemRef : undefined}
              to={to}
              onClick={closeMenu}
              role="menuitem"
              className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all pm-text-secondary hover:pm-text-primary hover:bg-[var(--pm-surface-hover)]"
            >
              <Icon size={18} className="pm-text-muted" />
              {label}
            </Link>
          ))}

          <div className="my-2 border-t border-[var(--pm-divider)]" />

          <Button
            variant="text"
            fullWidth
            customVariant="menuItemDanger"
            role="menuitem"
            onClick={() => {
              onLogout?.();
              closeMenu();
            }}
          >
            <LogOut size={18} />
            <span>Log out</span>
          </Button>
        </>
      )}
    </DropdownMenu>
  );
};
