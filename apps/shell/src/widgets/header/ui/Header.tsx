import { useState } from "react";
import { Menu, X, Bell } from "lucide-react";
import { MOCK_USER, navItems } from "@/entities/user/model/constants";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 py-3 px-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />

        <Navigation
          items={navItems}
          className="hidden lg:flex items-center gap-x-3"
        />

        <div className="flex items-center gap-x-4">
          <button className="relative cursor-pointer text-slate-400 p-2 hover:bg-white/5 rounded-full transition-colors">
            <Bell className="size-6" />
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          <UserMenu user={MOCK_USER} />

          <button
            className="lg:hidden p-2 text-white bg-white/5 rounded-xl transition-all hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-white/5 mt-4">
          <Navigation
            items={navItems}
            isMobile
            className="flex flex-col gap-y-2 p-6"
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
};
