import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { getNavItems } from "@/entities/user/model/constants";
import { UserRole } from "@/entities/user/types";

import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu";
import { Button, useAppTheme } from "@promentorapp/ui-kit";
import { NotificationsButton } from "./NotificationsButton";

interface HeaderProps {
  role: UserRole;
}

export const Header = ({ role }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mode, toggleMode } = useAppTheme();
  const navItems = getNavItems(role);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--pm-divider)] px-6 py-3 transition-colors">
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
            aria-label={
              mode === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            title={
              mode === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <NotificationsButton />

          <UserMenu
            user={{
              id: "viewer",
              fullName: role === "MENTOR" ? "Mentor" : "Regular User",
              role,
              email: "user@promentor.local",
            }}
          />

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
        className={`lg:hidden mt-4 border-t border-[var(--pm-divider)] bg-[var(--pm-surface-overlay)] ${isMobileMenuOpen ? "block" : "hidden"}`}
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
