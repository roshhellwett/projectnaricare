import { Link, useLocation } from "@tanstack/react-router";
import { Home, ClipboardCheck, CalendarHeart, BookOpen, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: <Home className="h-5 w-5" />, label: "Home", to: "/" },
  { icon: <ClipboardCheck className="h-5 w-5" />, label: "Check-in", to: "/assessment" },
  { icon: <CalendarHeart className="h-5 w-5" />, label: "Tracker", to: "/tracker" },
  { icon: <BookOpen className="h-5 w-5" />, label: "History", to: "/history" },
  { icon: <Stethoscope className="h-5 w-5" />, label: "Doctor", to: "/doctor" },
];

export function BottomNav() {
  const location = useLocation();

  // Hide bottom nav if we're inside the /ask chat page since it's full-screen
  if (location.pathname.startsWith("/ask")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-hairline bg-[#1c1220]/80 px-2 pb-[env(safe-area-inset-bottom,0)] pt-2 backdrop-blur-xl md:hidden print:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs transition-colors",
              isActive ? "text-accent-gold-soft font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
