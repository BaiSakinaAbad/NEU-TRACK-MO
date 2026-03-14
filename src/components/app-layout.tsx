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

  // Sync internal search state with URL search params when navigation happens
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (currentSearch !== searchValue) {
      setSearchValue(currentSearch);
    }
  }, [searchParams, pathname]);

  if (!user) return <>{children}</>;

  const handleSearch = (term: string) => {
    setSearchValue(term);
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }

    const newQuery = params.toString() ? `?${params.toString()}` : '';
    
    // If we are on a searchable page, replace URL to update parameters
    if (pathname === '/moas' || pathname === '/admin/users') {
      router.replace(`${pathname}${newQuery}`);
    } else {
      // If we are on dashboard or other, push to MOA list with search
      router.push(`/moas${newQuery}`);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['ADMIN', 'FACULTY'] },
    { name: 'MOA List', icon: FileText, href: '/moas', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { name: 'User Management', icon: Users, href: '/admin/users', roles: ['ADMIN'] },
    { name: 'Audit Trail', icon: History, href: '/admin/audit', roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  const showSearch = pathname === '/moas' || pathname === '/admin/users' || pathname === '/dashboard';
  const searchPlaceholder = pathname === '/admin/users' 
    ? "Search users..." 
    : "Search MOAs...";

  return (
    <div className="min-h-screen w-full bg-[#fcfdfe] font-body flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 h-16 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl px-4 sm:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="mx-auto flex h-full items-center justify-between max-w-screen-2xl">
          
          {/* Left Side: Brand & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-6">
                <div className="flex items-center gap-3 mb-8">
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
                          ? "bg-accent text-primary" 
                          : "text-muted-foreground hover:bg-accent/40"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <Radar className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-primary tracking-tight hidden sm:inline-block">Track Mo</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center ml-8 gap-1">
              {filteredMenu.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                    pathname === item.href 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side: Search & User Profile */}
          <div className="flex items-center gap-4">
            {showSearch && (
              <div className="relative hidden lg:flex items-center h-10 w-64 px-3 bg-muted/30 rounded-xl border border-border/40 focus-within:border-primary/30 focus-within:bg-white transition-all">
                <Search className="h-4 w-4 text-muted-foreground/60 mr-2" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder={searchPlaceholder}
                  className="bg-transparent border-none focus:ring-0 w-full outline-none text-xs font-medium placeholder:text-muted-foreground/50"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-muted/30 transition-all select-none border border-transparent hover:border-border/40">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/5 shadow-sm">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs uppercase">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                    <span className="text-[11px] font-bold text-foreground truncate max-w-[100px]">{user.name}</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{user.role}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-border/50">
                <DropdownMenuLabel className="font-bold text-xs text-muted-foreground px-2 py-1.5 uppercase tracking-widest">
                  Account Settings
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto max-w-screen-2xl p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
