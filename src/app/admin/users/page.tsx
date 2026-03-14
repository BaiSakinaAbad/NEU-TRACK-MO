"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, History, Ban, CheckCircle2, Clock, Hash, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useSearchParams } from 'next/navigation';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  
  const usersQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [selectedUserForActivity, setSelectedUserForActivity] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const toggleBlock = useCallback((userId: string, currentStatus: boolean) => {
    const userRef = doc(firestore, 'users', userId);
    
    updateDoc(userRef, { isBlocked: !currentStatus })
      .catch(async (err) => {
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { isBlocked: !currentStatus }
          });
          errorEmitter.emit('permission-error', permissionError);
        } else {
          toast({
            variant: "destructive",
            title: "Operation Failed",
            description: "Could not update user status. Please try again.",
          });
        }
      });
  }, [firestore, toast]);

  const handleViewActivity = useCallback((user: User) => {
    setTimeout(() => {
      setSelectedUserForActivity(user);
      setIsActivityDialogOpen(true);
    }, 0);
  }, []);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive font-semibold">Access Denied: Administrative privileges required.</p>
      </div>
    );
  }

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
          <p className="text-muted-foreground mt-2 text-lg">Control user access and track activities.</p>
        </div>
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
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-11 w-11 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px] rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px] rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell className="text-right px-6"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  {filteredUsers.map((user) => (
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
                            <DropdownMenuItem 
                              className="cursor-pointer rounded-lg py-2"
                              onSelect={() => handleViewActivity(user)}
                            >
                              <History className="mr-2 h-4 w-4" /> View Activity
                            </DropdownMenuItem>
                            {user.role !== 'ADMIN' && (
                              <>
                                <DropdownMenuSeparator className="my-1 opacity-50" />
                                <DropdownMenuItem 
                                  className={`cursor-pointer rounded-lg py-2 ${user.isBlocked ? 'text-green-600' : 'text-destructive'}`}
                                  onSelect={() => toggleBlock(user.id, user.isBlocked)}
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
                  {!isLoading && filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                            <Search className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                          <p className="text-muted-foreground font-bold text-xl">Found nothing</p>
                          <p className="text-muted-foreground/60 text-sm max-w-xs mx-auto">
                            No users match your search term "{searchTerm}". Try checking for typos or using different keywords.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <History className="h-6 w-6" /> User Activity
            </DialogTitle>
            <DialogDescription>
              Login and session data for {selectedUserForActivity?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" /> Last Login Time
              </Label>
              <div className="p-3 bg-muted/30 rounded-xl text-sm font-semibold border border-border/40">
                {selectedUserForActivity?.lastLogin ? new Date(selectedUserForActivity.lastLogin).toLocaleString() : 'No recent login recorded'}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Hash className="h-3 w-3" /> Current Visit ID
              </Label>
              <div className="p-3 bg-muted/30 rounded-xl text-sm font-mono break-all border border-border/40">
                {selectedUserForActivity?.visitId || 'No active session'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsActivityDialogOpen(false)} className="w-full h-11 rounded-xl font-bold">Close Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}