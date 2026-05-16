import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, FileText, Cpu, Upload, Moon, Sun, MessageSquareHeart } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze", icon: Sparkles },
  { to: "/upload", label: "Upload Data", icon: Upload },
  { to: "/insights", label: "Insights Report", icon: FileText },
  { to: "/technical", label: "How It Works", icon: Cpu },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex w-full">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-bg grid place-items-center shadow-[var(--shadow-glow)]">
            <MessageSquareHeart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Sentilytics</div>
            <div className="text-xs text-muted-foreground">AI Sentiment Suite</div>
          </div>
        </div>
        <nav className="px-3 py-2 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
          <div className="glass-card rounded-xl p-4 text-xs text-muted-foreground">
            <div className="font-medium text-foreground mb-1">Privacy-first</div>
            Analysis runs locally in your browser. No text leaves your device.
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 md:px-8 backdrop-blur-md bg-background/60 sticky top-0 z-10">
          <div className="md:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-md gradient-bg" />
            <span className="font-semibold">Sentilytics</span>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            <span className="gradient-text font-medium">AI</span> sentiment analytics dashboard
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>
        <nav className="md:hidden border-b overflow-x-auto flex gap-1 px-2 py-2 bg-background/60">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-xs whitespace-nowrap rounded-md px-3 py-1.5",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
