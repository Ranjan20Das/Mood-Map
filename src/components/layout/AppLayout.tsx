import { Outlet } from "@tanstack/react-router";
import { BottomTabBar } from "./BottomTabBar";
import { FloatingActionButton } from "./FloatingActionButton";
import { HamburgerMenu } from "./HamburgerMenu";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-lg">
        <HamburgerMenu />
        <h1 className="font-heading text-lg font-bold text-primary">MoodMap</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* FAB & Bottom Tabs */}
      <FloatingActionButton />
      <BottomTabBar />
    </div>
  );
}
