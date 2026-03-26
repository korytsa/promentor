import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { getNavItemsByRole } from "@/features/navigation-by-role";
import { MOCK_USER } from "@/features/viewer-session";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu";
import { Button, useAppTheme } from "@promentorapp/ui-kit";
import { NotificationsButton } from "./NotificationsButton";
import { cn } from "@/shared/lib/utils";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mode, toggleMode } = useAppTheme();
  const navItems = getNavItemsByRole(MOCK_USER.role);
  const isDark = mode === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 py-3 px-6 border-b backdrop-blur-xl transition-colors",
        isDark
          ? "border-white/10 bg-slate-900/80"
          : "border-slate-200/90 bg-white/80",
      )}
    >
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
            sx={{
              color: isDark ? "rgba(148, 163, 184, 1)" : "#64748b",
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(248, 250, 252, 1)",
              },
            }}
          >
            {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <NotificationsButton />

          <UserMenu user={MOCK_USER} />

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
        className={cn(
          "lg:hidden border-t mt-4",
          isDark ? "bg-slate-900 border-white/5" : "bg-white border-slate-200",
          isMobileMenuOpen ? "block" : "hidden",
        )}
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
