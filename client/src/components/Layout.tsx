import { Link, useLocation } from "wouter";
import { Cpu, History, Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Refine", path: "/", icon: Zap },
    { label: "History", path: "/history", icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Dark overlay for background image */}
      <div className="fixed inset-0 bg-background/95 z-[-1]" />

      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-background/50 backdrop-blur-md p-6 sticky top-0 h-screen z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Prompt<span className="text-primary">AI</span>
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 py-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
          <p className="text-xs text-primary/80 font-medium mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Online & Ready</span>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Cpu className="w-6 h-6 text-primary" />
           <span className="font-bold text-lg">PromptAI</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-20 px-6">
          <nav className="space-y-4">
             {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <div 
                  className="flex items-center gap-4 py-4 border-b border-border/50 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-6 h-6 text-primary" />
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
