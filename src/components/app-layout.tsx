"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './auth-context';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  History, 
  LogOut, 
  Search, 
  Radar, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (currentSearch !== searchValue) {
      setSearchValue(currentSearch);
    }
  }, [searchParams]);

  // Bypass layout for login and onboarding pages
  if (!user || pathname === '/login' || pathname === '/onboarding') return <>{children}</>;

  const handleSearch = (term: string) => {
    setSearchValue(term);
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }

    const newQuery = params.toString() ? `?${params.toString()}` : '';
    
    if (pathname === '/moas' || pathname === '/admin/users') {
      router.replace(`${pathname}${newQuery}`);
    } else {
      router.push(`/moas${newQuery}`);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['ADMIN', 'FACULTY'] },
    { name: 'MOA List', icon: FileText, href: '/moas', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { name: 'Users', icon: Users, href: '/admin/users', roles: ['ADMIN'] },
    { name: 'Logs', icon: History, href: '/admin/audit', roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  const showSearch = pathname === '/moas' || pathname === '/admin/users';
  const searchPlaceholder = pathname === '/admin/users' ? "Search users..." : "Search agreements...";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] font-body flex flex-col">
      <header className="sticky top-0 z-50 h-14 w-full border-b border-border/40 bg-white shadow-sm">
        <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 max-w-screen-2xl gap-4">
          
          {/* Left Section: Logo & Desktop Nav */}
          <div className="flex items-center gap-6 overflow-hidden">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Radar className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-primary tracking-tight hidden xs:block">Track Mo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {filteredMenu.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
                    pathname === item.href 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section: Search & Profile */}
          <div className="flex items-center gap-3 flex-1 justify-end max-w-2xl">
            {showSearch && (
              <div className="relative flex items-center h-9 w-full max-w-[280px] px-3 bg-muted/40 rounded-lg border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <Search className="h-4 w-4 text-muted-foreground/60 mr-2 shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder={searchPlaceholder}
                  className="bg-transparent border-none focus:ring-0 w-full outline-none text-xs font-medium placeholder:text-muted-foreground/50"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchValue && (
                  <button 
                    onClick={() => handleSearch('')}
                    className="ml-1 p-0.5 hover:bg-muted rounded-full text-muted-foreground/60 hover:text-foreground transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/60 transition-all outline-none group border border-transparent hover:border-border/40">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/5 shadow-sm">
                      <AvatarFallback className="bg-primary/5 text-primary font-bold text-[10px] uppercase">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="text-[10px] font-bold text-foreground">{user.name}</span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-tight">{user.role}</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-border/50">
                  <DropdownMenuLabel className="font-bold text-[10px] text-muted-foreground px-2 py-1.5 uppercase tracking-widest">
                    Account
                  </DropdownMenuLabel>
                  <div className="px-2 py-2 mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="opacity-50" />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive focus:bg-destructive/5 font-bold text-xs"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] p-6">
                  <div className="flex items-center gap-2 mb-8">
                    <Radar className="text-primary w-6 h-6" />
                    <span className="font-bold text-lg text-primary">Track Mo</span>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {filteredMenu.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                          pathname === item.href 
                            ? "bg-primary/5 text-primary" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
