import { Link } from "@tanstack/react-router";
import { Menu, History, Heart, Settings, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const menuItems = [
  { to: "/history", icon: History, label: "History" },
  { to: "/selfcare", icon: Heart, label: "Self-Care" },
  { to: "/heatmap", icon: Settings, label: "Mood Heatmap" },
] as const;

export function HamburgerMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="font-heading text-xl font-bold text-primary">
            MoodMap
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SheetClose asChild key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
