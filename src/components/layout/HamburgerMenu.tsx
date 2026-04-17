import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, History, Heart, BarChart3, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const menuItems = [
  { to: "/history", icon: History, label: "History" },
  { to: "/selfcare", icon: Heart, label: "Self-Care" },
  { to: "/heatmap", icon: BarChart3, label: "Mood Heatmap" },
] as const;

export function HamburgerMenu() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

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
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="font-heading text-xl font-bold text-primary">
            MoodMap
          </SheetTitle>
          {user && (
            <p className="text-xs text-muted-foreground truncate text-left">
              {profile?.display_name || user.email}
            </p>
          )}
        </SheetHeader>
        <nav className="flex flex-1 flex-col gap-1 p-3">
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
        <div className="border-t p-3">
          <SheetClose asChild>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
