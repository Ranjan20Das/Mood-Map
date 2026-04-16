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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/80 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
