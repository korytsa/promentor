import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Avatar } from "@promentorapp/ui-kit";
import { User } from "@/entities/user/types";

interface UserMenuProps {
  user: User;
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative flex items-center gap-x-4">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="user-menu"
        aria-label="User menu"
        className="flex items-center gap-x-3 cursor-pointer group appearance-none border-none bg-transparent p-0"
      >
        <div className="hidden md:flex flex-col gap-1 text-right">
          <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
            Welcome,
          </p>
          <h2 className="text-xs uppercase font-bold text-white/80 group-hover:text-white transition-colors">
            {user.fullName}
          </h2>
        </div>

        <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="user-menu"
            role="menu"
            className="absolute right-0 top-14 w-56 p-2 bg-slate-800 border border-white/5 rounded-lg shadow-xl z-50 backdrop-blur-3xl overflow-hidden transition-all duration-200"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                Signed in as
              </p>
              <p className="text-sm font-medium text-white truncate">
                {user.email}
              </p>
            </div>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium text-sm"
            >
              <UserIcon size={18} className="text-slate-500" />
              Profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium text-sm"
            >
              <Settings size={18} className="text-slate-500" />
              Settings
            </Link>
            <div className="my-2 border-t border-white/5" />
            <button className="w-full flex items-center gap-x-3 px-3 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all font-bold text-sm">
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
