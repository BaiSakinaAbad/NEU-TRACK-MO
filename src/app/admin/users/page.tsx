
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { MOCK_USERS } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, MoreHorizontal, UserCog, Ban, CheckCircle2, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserRole } from '@/lib/types';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STUDENT');
  const [newUserCollege, setNewUserCollege] = useState('');

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

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail.endsWith('@neu.edu.ph')) {
      alert('Only institutional @neu.edu.ph emails are allowed.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      college: newUserCollege || undefined,
      isBlocked: false,
    };

    setUsers([newUser, ...users]);
    setIsAddDialogOpen(false);
    
    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('STUDENT');
    setNewUserCollege('');
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
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary h-12 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold">
              <UserPlus className="mr-2 h-5 w-5" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">Add New User</DialogTitle>
              <DialogDescription>
                Create a new account for a student, faculty, or administrator.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email (@neu.edu.ph)</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="name@neu.edu.ph" 
                  className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</Label>
                  <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                    <SelectTrigger className="h-12 bg-muted/30 border-none focus:ring-1 focus:ring-primary/20">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">College</Label>
                  <Input 
                    id="college" 
                    placeholder="CAS, CCS, etc." 
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    value={newUserCollege}
                    onChange={(e) => setNewUserCollege(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full h-12 bg-primary font-bold rounded-xl shadow-lg shadow-primary/20">
                  Create User Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-base">
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
                        {user.role !== 'ADMIN' && (
                          <>
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
                          </>
                        )}
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
