import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, PenLine, BarChart3, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/entry", icon: PenLine, label: "Entry" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/recommendations", icon: Sparkles, label: "For You" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomTabBar() {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/80 backdrop-blur-lg pb-safe"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[44px] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn("h-5 w-5 transition-all", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
