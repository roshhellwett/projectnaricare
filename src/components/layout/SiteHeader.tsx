import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { to: "/assessment", label: "Assessment" },
  { to: "/tracker", label: "Tracker" },
  { to: "/history", label: "History" },
  { to: "/doctor", label: "Doctor visit" },
  { to: "/ask", label: "Ask Nari" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-[#1c1220]/60 backdrop-blur-xl print:hidden">
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
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent-gold-soft/80">
                Har Nari Ki Saheli
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop nav — hidden on mobile */}
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

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/assessment"
            className="hidden btn-primary-glow items-center rounded-full px-5 py-2.5 text-sm font-semibold md:inline-flex"
          >
            Begin assessment
          </Link>

          {/* Mobile hamburger menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-hairline/30 bg-white/5 text-foreground transition-colors hover:bg-white/10 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-l border-hairline bg-[#1c1220] p-0">
              <SheetHeader className="border-b border-hairline/50 px-5 py-4">
                <SheetTitle className="flex items-center gap-3 text-left">
                  <img
                    src={logoUrl}
                    alt="NariCare logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-hairline/50"
                    draggable={false}
                  />
                  <span className="font-serif text-base font-semibold text-foreground">
                    NariCare
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="tap-target flex items-center rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 hover:text-accent-gold-soft"
                    activeProps={{ className: "bg-white/10 text-accent-gold-soft" }}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-hairline/30 pt-4">
                  <Link
                    to="/assessment"
                    onClick={() => setOpen(false)}
                    className="btn-primary-glow flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
                  >
                    Begin assessment
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
