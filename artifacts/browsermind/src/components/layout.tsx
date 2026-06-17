import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Terminal, LayoutDashboard, PlusCircle, Activity, History, Copy, Settings, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks/new", label: "New Task", icon: PlusCircle },
  { href: "/tasks", label: "History", icon: History },
  { href: "/templates", label: "Templates", icon: Copy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row dark">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div className="font-mono text-sm font-bold tracking-tight">
            Browser<span className="text-primary">Mind</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-mono text-muted-foreground mb-4 px-2 uppercase tracking-wider">Menu</div>
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary font-medium border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="text-xs font-mono text-muted-foreground flex items-center justify-between">
            <span>Agent Status</span>
            <span className="flex items-center gap-1.5 text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Idle
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
        <div className="max-w-5xl mx-auto w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
