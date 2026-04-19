import { Outlet } from "@tanstack/react-router";
import { BottomTabBar } from "./BottomTabBar";
import { FloatingActionButton } from "./FloatingActionButton";
import { HamburgerMenu } from "./HamburgerMenu";
import { OfflineIndicator } from "./OfflineIndicator";
import { PwaInstallPrompt } from "./PwaInstallPrompt";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-lg"
      >
        <HamburgerMenu />
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-lg font-bold text-primary">MoodMap</h1>
          <OfflineIndicator />
        </div>
        <div className="w-10" aria-hidden="true" />
      </header>

      <main id="main-content" role="main" className="flex-1 pb-20" tabIndex={-1}>
        <Outlet />
      </main>

      <FloatingActionButton />
      <BottomTabBar />
      <PwaInstallPrompt />
    </div>
  );
}
