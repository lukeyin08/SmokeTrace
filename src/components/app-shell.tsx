"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Home,
  LogOut,
  MoreVertical,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "U";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AppShell({
  children,
  fullName,
  email,
}: {
  children: React.ReactNode;
  fullName?: string | null;
  email?: string | null;
}) {
  const pathname = usePathname();
  const allNav = [...NAV_ITEMS, ...SECONDARY_NAV_ITEMS];

  return (
    <div className="min-h-screen bg-app-gradient">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card/60 backdrop-blur md:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {allNav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 p-3">
          <Button asChild variant="destructive" className="w-full">
            <Link href="/emergency">
              <AlertTriangle className="h-4 w-4" />
              Emergency mode
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/cravings/new">
              <Plus className="h-4 w-4" />
              Log craving
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="md:hidden">
            <Link href="/dashboard">
              <Logo />
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-destructive md:hidden"
              aria-label="Emergency mode"
            >
              <Link href="/emergency">
                <AlertTriangle className="h-5 w-5" />
              </Link>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/15 text-primary">
                      {initials(fullName, email)}
                    </AvatarFallback>
                  </Avatar>
                  <MoreVertical className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="truncate">{fullName || "Your account"}</span>
                    {email && (
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {email}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Home page
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/privacy">
                    <ShieldCheck className="h-4 w-4" />
                    Privacy &amp; disclaimer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/logout" method="post" className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10">
          <div className="mx-auto w-full max-w-5xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
