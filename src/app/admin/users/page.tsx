"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { MOCK_USERS } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, MoreHorizontal, UserCog, Ban, CheckCircle2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(MOCK_USERS);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive font-semibold">Access Denied: Administrative privileges required.</p>
      </div>
    );
  }

  const toggleBlock = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
    ));
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-none';
      case 'FACULTY': return 'bg-blue-100 text-blue-700 border-none';
      case 'STUDENT': return 'bg-gray-100 text-gray-700 border-none';
      default: return '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">User Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">Control user access and assign roles within the platform.</p>
        </div>
        <Button className="bg-primary h-12 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold">
          <UserPlus className="mr-2 h-5 w-5" /> Add User
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-black/5 bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/50 hover:bg-muted/30">
                <TableHead className="font-bold text-primary py-5 px-6">User</TableHead>
                <TableHead className="font-bold text-primary py-5">Role</TableHead>
                <TableHead className="font-bold text-primary py-5">Status</TableHead>
                <TableHead className="font-bold text-primary py-5">College</TableHead>
                <TableHead className="text-right px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-accent/10 transition-colors border-b border-border/30">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 shadow-sm border border-border/50">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getRoleColor(user.role)} font-bold px-3 py-1 rounded-lg`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive" className="flex w-fit items-center gap-1.5 font-bold px-3 py-1 rounded-lg">
                        <Ban className="h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600 flex w-fit items-center gap-1.5 font-bold px-3 py-1 rounded-lg text-white border-none">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-muted-foreground">{user.college || '—'}</span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-accent rounded-lg">
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl border-border/50 min-w-[160px]">
                        <DropdownMenuItem className="cursor-pointer rounded-lg py-2">
                          <UserCog className="mr-2 h-4 w-4" /> Manage Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 opacity-50" />
                        <DropdownMenuItem 
                          className={`cursor-pointer rounded-lg py-2 ${user.isBlocked ? 'text-green-600' : 'text-destructive'}`}
                          onClick={() => toggleBlock(user.id)}
                        >
                          {user.isBlocked ? (
                            <><CheckCircle2 className="mr-2 h-4 w-4" /> Unblock User</>
                          ) : (
                            <><Ban className="mr-2 h-4 w-4" /> Block User</>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}