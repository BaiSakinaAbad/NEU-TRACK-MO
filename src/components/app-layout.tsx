"use client";

import React from 'react';
import { useAuth } from './auth-context';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, Users, History, LogOut, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return <>{children}</>;

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { name: 'MOA List', icon: FileText, href: '/moas', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { name: 'User Management', icon: Users, href: '/admin/users', roles: ['ADMIN'] },
    { name: 'Audit Trail', icon: History, href: '/admin/audit', roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-body">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 flex flex-row items-center gap-2 border-b">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary tracking-tight">MOA Track</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Monitoring System</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {filteredMenu.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-3 px-4 py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t mt-auto">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search MOAs by college, industry, or company..." 
                className="bg-transparent border-none focus:ring-0 w-full max-w-md"
              />
            </div>
          </header>
          <main className="p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}