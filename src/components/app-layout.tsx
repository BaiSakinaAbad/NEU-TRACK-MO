"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, Users, History, LogOut, Search, Radar } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  if (!user) return <>{children}</>;

  const handleSearch = (term: string) => {
    setSearchValue(term);
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    
    // Only update params for pages that support search, otherwise redirect to MOA list
    if (pathname === '/moas' || pathname === '/admin/users') {
      router.replace(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/moas?${params.toString()}`);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['ADMIN', 'FACULTY'] },
    { name: 'MOA List', icon: FileText, href: '/moas', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { name: 'User Management', icon: Users, href: '/admin/users', roles: ['ADMIN'] },
    { name: 'Audit Trail', icon: History, href: '/admin/audit', roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  // Only show search on MOA List and User Management
  const showSearch = pathname === '/moas' || pathname === '/admin/users';
  const searchPlaceholder = pathname === '/admin/users' 
    ? "Search users by name or email..." 
    : "Search MOAs by college, industry, or company...";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#fcfdfe] font-body">
        <Sidebar className="border-r border-border/60">
          <SidebarHeader className="p-6 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Radar className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary leading-tight">Track Mo</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Monitoring System</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 pt-4">
            <SidebarMenu className="gap-2">
              {filteredMenu.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className={`h-12 px-4 rounded-xl transition-all duration-200 ${
                      pathname === item.href 
                      ? 'bg-accent text-primary shadow-sm font-semibold' 
                      : 'hover:bg-accent/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Link href={item.href} className="flex items-center gap-4">
                      <item.icon className={`h-5 w-5 ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-6 mt-auto">
            <Separator className="mb-6 opacity-50" />
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10 ring-2 ring-primary/5 shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-foreground truncate">{user.name}</span>
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-[#fcfdfe]">
          <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b border-border/40 bg-white/80 backdrop-blur-xl px-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <SidebarTrigger className="md:hidden" />
            {showSearch && (
              <div className="flex-1 flex items-center gap-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4 text-muted-foreground/60" />
                <input 
                  type="text" 
                  placeholder={searchPlaceholder}
                  className="bg-transparent border-none focus:ring-0 w-full max-w-xl outline-none placeholder:text-muted-foreground/50"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            )}
          </header>
          <main className="p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
