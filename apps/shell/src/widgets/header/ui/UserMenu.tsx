import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Button, Avatar, Typography } from "@promentorapp/ui-kit";
import { User } from "@/entities/user/types";

interface UserMenuProps {
  user: User;
  onLogout?: () => void;
}

export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      firstMenuItemRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative flex items-center gap-x-4">
      <Button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="user-menu"
        aria-label="User menu"
        customVariant="menuTrigger"
      >
        <div className="hidden md:flex flex-col gap-1 text-right">
          <Typography
            component="p"
            className="text-[10px] font-black text-slate-500 tracking-widest uppercase"
          >
            Welcome,
          </Typography>
          <Typography
            component="h2"
            className="user-menu-trigger-title text-xs uppercase font-bold text-white/80 transition-colors"
          >
            {user.fullName}
          </Typography>
        </div>

        <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            id="user-menu"
            role="menu"
            className="absolute right-0 top-14 w-56 p-2 bg-slate-800 border border-white/5 rounded-lg shadow-xl z-50 backdrop-blur-3xl overflow-hidden transition-all duration-200"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-2">
              <Typography
                component="p"
                className="text-[10px] font-bold text-slate-500 uppercase mb-1"
              >
                Signed in as
              </Typography>
              <Typography
                component="p"
                className="text-sm font-medium text-white truncate"
              >
                {user.email}
              </Typography>
            </div>

            <Link
              ref={firstMenuItemRef}
              to="/profile"
              onClick={closeMenu}
              role="menuitem"
              className="w-full flex items-center gap-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium text-sm"
            >
              <UserIcon size={18} className="text-slate-500" />
              Profile
            </Link>

            <Link
              to="/settings"
              onClick={closeMenu}
              role="menuitem"
              className="w-full flex items-center gap-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium text-sm"
            >
              <Settings size={18} className="text-slate-500" />
              Settings
            </Link>

            <div className="my-2 border-t border-white/5" />

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
          </div>
        </>
      )}
    </div>
  );
};
