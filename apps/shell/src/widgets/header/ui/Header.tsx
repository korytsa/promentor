import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import type { User } from "@/entities/user/types";
import { getNavItems } from "@/entities/user/model/constants";

import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu";
import { Button, useAppTheme } from "@promentorapp/ui-kit";
import { NotificationsButton } from "./NotificationsButton";

type HeaderProps = {
  user: User;
};

export const Header = ({ user }: HeaderProps) => {
  const { mode, toggleMode } = useAppTheme();
  const isDark = mode === "dark";
  const navItems = getNavItems(user.role);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const themeToggleLabel = isDark
    ? "Switch to light theme"
    : "Switch to dark theme";
  const themeToggleSx = {
    color: isDark ? "rgba(148, 163, 184, 1)" : "#64748b",
    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
    "&:hover": {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(248, 250, 252, 1)",
    },
  };

  return (
    <header className="sticky top-0 z-50 py-3 px-6 border-b transition-colors border-slate-200/90 dark:border-white/10">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />

        <Navigation
          items={navItems}
          className="hidden lg:flex items-center gap-x-3"
        />

        <div className="flex items-center gap-x-4">
          <Button
            isIconOnly
            customVariant="glass"
            onClick={toggleMode}
            aria-label={themeToggleLabel}
            title={themeToggleLabel}
            sx={themeToggleSx}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <NotificationsButton />

          <UserMenu user={user} />

          <div className="lg:hidden">
            <Button
              isIconOnly
              customVariant="glass"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        role="navigation"
        aria-label="Mobile Navigation"
        className={`lg:hidden border-t mt-4 bg-white border-slate-200 dark:bg-slate-900 dark:border-white/5 ${isMobileMenuOpen ? "block" : "hidden"}`}
      >
        <Navigation
          items={navItems}
          isMobile
          className="flex flex-col gap-y-2 p-6"
          onItemClick={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </header>
  );
};
