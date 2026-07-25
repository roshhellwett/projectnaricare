import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logoUrl from "@/assets/logo.png";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const links = [
  { to: "/assessment", label: "Assessment" },
  { to: "/tracker", label: "Tracker" },
  { to: "/history", label: "History" },
  { to: "/doctor", label: "Doctor visit" },
  { to: "/ask", label: "Ask Nari" },
] as const;

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-[#1c1220]/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center justify-start">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <img
              src={logoUrl}
              alt="NariCare logo"
              width={56}
              height={56}
              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-hairline/50 shadow-lg shadow-accent-gold-soft/10 transition-transform group-hover:scale-105 group-hover:ring-accent-gold-soft/50"
              draggable={false}
            />
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate font-serif text-base sm:text-lg font-semibold tracking-tight">
                NariCare
              </span>
              <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Cycle · Health · Care
              </span>
            </div>
          </Link>
        </div>


        <nav className="hidden items-center justify-center gap-1 text-sm font-medium text-muted-foreground md:flex bg-white/[0.03] border border-white/10 rounded-full px-2 py-1.5 shadow-sm backdrop-blur-md">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 transition-all hover:bg-white/10 hover:text-accent-gold-soft"
              activeProps={{ className: "bg-white/10 text-accent-gold-soft shadow-inner" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4">
          <Link
            to="/assessment"
            className="hidden btn-primary-glow items-center rounded-full px-5 py-2.5 text-sm font-semibold md:inline-flex"
          >
            Begin assessment
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-surface-light hover:text-foreground md:hidden transition-colors">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="glass-panel w-[85vw] max-w-[320px] !border-r-0 !border-t-0 !border-b-0 p-6"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="mt-8 flex flex-col gap-6">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-accent-gold-soft"
                    activeProps={{ className: "text-accent-gold-soft font-semibold" }}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-4 pt-6 border-t border-hairline">
                  <Link
                    to="/assessment"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary-glow inline-flex w-full justify-center items-center rounded-full px-5 py-3 text-sm font-semibold"
                  >
                    Begin assessment
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
