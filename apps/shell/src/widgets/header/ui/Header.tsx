import { useState } from "react";
import { Menu, X } from "lucide-react";
import { getNavItems } from "@/entities/user/model/constants";
import { UserRole } from "@/entities/user/types";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu";
import { Button } from "@promentorapp/ui-kit";
import { NotificationsButton } from "./NotificationsButton";

interface HeaderProps {
  role: UserRole;
}

export const Header = ({ role }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = getNavItems(role);

  return (
    <header className="sticky top-0 z-50 py-3 px-6 border-b border-white/10">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />

        <Navigation
          items={navItems}
          className="hidden lg:flex items-center gap-x-3"
        />

        <div className="flex items-center gap-x-4">
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
        className={`lg:hidden bg-slate-900 border-t border-white/5 mt-4 
        ${isMobileMenuOpen ? "block" : "hidden"}`}
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
