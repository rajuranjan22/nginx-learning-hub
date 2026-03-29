import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border"
      style={{ background: "var(--header-bg)" }}
      data-ocid="header.panel"
    >
      <div className="flex items-center h-14 px-4 md:px-6 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--green-accent)" }}
          >
            NGINX
          </span>
          <span className="text-xl font-bold text-foreground">Academy</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {["Explore", "Documentation", "Community", "Pricing"].map((link) => (
            <button
              type="button"
              key={link}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
              data-ocid={`header.${link.toLowerCase()}.link`}
            >
              {link}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-auto md:ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-8 text-sm bg-secondary border-border focus-visible:ring-primary"
            data-ocid="header.search_input"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90 h-8 gap-1"
            data-ocid="header.get_started.primary_button"
          >
            Get Started <ChevronRight className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="hidden sm:flex border-border text-muted-foreground hover:text-foreground h-8"
            data-ocid="header.login.secondary_button"
          >
            Login
          </Button>
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-border">
          {["Explore", "Documentation", "Community", "Pricing"].map((link) => (
            <button
              type="button"
              key={link}
              className="block w-full text-left px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
