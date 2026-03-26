import { useRef } from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Button, Avatar, Typography } from "@promentorapp/ui-kit";
import type { User } from "@/entities/user";
import { DropdownMenu } from "@/shared/ui/dropdown/DropdownMenu";

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
              className="text-[10px] font-black tracking-widest uppercase text-slate-500"
            >
              Welcome,
            </Typography>
            <Typography
              component="h2"
              className="user-menu-trigger-title text-xs uppercase font-bold transition-colors text-slate-700 dark:text-white/80"
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
          <div className="px-3 py-2 border-b mb-2 border-slate-200 dark:border-white/5">
            <Typography
              component="p"
              className="text-[10px] font-bold uppercase mb-1 text-slate-500"
            >
              Signed in as
            </Typography>
            <Typography
              component="p"
              className="text-sm font-medium truncate text-slate-900 dark:text-white"
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
              className="w-full flex items-center gap-x-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5"
            >
              <Icon size={18} className="text-slate-400 dark:text-slate-500" />
              {label}
            </Link>
          ))}

          <div className="my-2 border-t border-slate-200 dark:border-white/5" />

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
