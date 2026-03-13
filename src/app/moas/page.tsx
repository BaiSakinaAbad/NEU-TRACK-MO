"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/components/auth-context';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit2, Trash2, ArchiveRestore, AlertTriangle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';
import { softDeleteMOA, recoverMOA } from '@/lib/moa-service';
import { MOA } from '@/lib/types';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

export default function MOAListPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PROCESSING' | 'DELETED'>('ALL');
  
  const moasQuery = useMemo(() => {
    if (!user) return null; // Guard against unauthenticated queries
    return query(collection(firestore, 'moas'), orderBy('updatedAt', 'desc'));
  }, [firestore, user]);

  const { data: moas, isLoading: isDataLoading } = useCollection<MOA>(moasQuery);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isStudent = user?.role === 'STUDENT';
  const searchTerm = searchParams.get('search') || '';

  const filteredMOAs = useMemo(() => {
    let list = moas || [];

    if (isStudent) {
      list = list.filter(m => m.status.startsWith('APPROVED') && !m.isDeleted);
    } else {
      if (user?.role !== 'ADMIN') {
        list = list.filter(m => !m.isDeleted);
      } else if (activeTab === 'DELETED') {
        list = list.filter(m => m.isDeleted);
      } else if (activeTab === 'ACTIVE') {
        list = list.filter(m => m.status.startsWith('APPROVED') && !m.isDeleted);
      } else if (activeTab === 'PROCESSING') {
        list = list.filter(m => m.status.startsWith('PROCESSING') && !m.isDeleted);
      } else {
        list = list.filter(m => !m.isDeleted);
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(m => 
        m.companyName.toLowerCase().includes(term) ||
        m.endorsedByCollege.toLowerCase().includes(term) ||
        m.industryType.toLowerCase().includes(term) ||
        m.contactPerson.toLowerCase().includes(term)
      );
    }

    return list;
  }, [user, searchTerm, activeTab, isStudent, moas]);

  const handleSoftDelete = async (moa: MOA) => {
    if (!user) return;
    await softDeleteMOA(firestore, user, moa);
  };

  const handleRecover = async (moa: MOA) => {
    if (!user) return;
    await recoverMOA(firestore, user, moa);
  };

  const getStatusBadge = (status: string) => {
    if (status.startsWith('APPROVED')) return <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-100 font-bold px-3 py-1 rounded-lg">Approved</Badge>;
    if (status.startsWith('PROCESSING')) return <Badge className="bg-blue-100 text-blue-800 border-none hover:bg-blue-100 font-bold px-3 py-1 rounded-lg">Processing</Badge>;
    if (status === 'EXPIRED') return <Badge variant="destructive" className="border-none font-bold px-3 py-1 rounded-lg">Expired</Badge>;
    if (status === 'EXPIRING') return <Badge className="bg-orange-100 text-orange-800 border-none hover:bg-orange-100 font-bold px-3 py-1 rounded-lg">Expiring</Badge>;
    return <Badge variant="outline" className="font-bold px-3 py-1 rounded-lg">{status}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Memorandum of Agreements</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage and track all university partnerships.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button className="bg-primary hover:bg-primary/90 h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold">
            <Plus className="mr-2 h-5 w-5" /> Add New MOA
          </Button>
        )}
      </div>

      <Card className="border-none shadow-xl shadow-black/5 bg-white rounded-2xl overflow-hidden">
        {!isStudent && (
          <div className="p-6 pb-0 flex justify-between items-center border-b border-border/50">
            <div className="flex items-center gap-2 border rounded-xl p-1 bg-muted/20 mb-6">
              <Button 
                variant={activeTab === 'ALL' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('ALL')}
                className={`text-xs h-9 px-4 rounded-lg transition-all ${activeTab === 'ALL' ? 'shadow-sm font-bold' : ''}`}
              >
                All Agreements
              </Button>
              <Button 
                variant={activeTab === 'ACTIVE' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('ACTIVE')}
                className={`text-xs h-9 px-4 rounded-lg transition-all ${activeTab === 'ACTIVE' ? 'shadow-sm font-bold' : ''}`}
              >
                Active
              </Button>
              <Button 
                variant={activeTab === 'PROCESSING' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('PROCESSING')}
                className={`text-xs h-9 px-4 rounded-lg transition-all ${activeTab === 'PROCESSING' ? 'shadow-sm font-bold' : ''}`}
              >
                Processing
              </Button>
              {user?.role === 'ADMIN' && (
                <Button 
                  variant={activeTab === 'DELETED' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveTab('DELETED')}
                  className={`text-xs h-9 px-4 rounded-lg transition-all ${activeTab === 'DELETED' ? 'shadow-sm font-bold text-destructive' : ''}`}
                >
                  Recycle Bin
                </Button>
              )}
            </div>
          </div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isDataLoading || isAuthLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Loading agreements...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-b border-border/50 hover:bg-muted/30">
                    <TableHead className="font-bold text-primary py-5 px-6">Company</TableHead>
                    <TableHead className="font-bold text-primary py-5">Contact Person</TableHead>
                    <TableHead className="font-bold text-primary py-5">Industry</TableHead>
                    <TableHead className="font-bold text-primary py-5">Status</TableHead>
                    <TableHead className="font-bold text-primary py-5">College</TableHead>
                    {!isStudent && <TableHead className="font-bold text-primary py-5">Expiry Date</TableHead>}
                    <TableHead className="text-right px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMOAs.length > 0 ? (
                    filteredMOAs.map((moa) => (
                      <TableRow key={moa.id} className="hover:bg-accent/10 transition-colors border-b border-border/30">
                        <TableCell className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{moa.companyName}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px] font-normal mt-0.5">{moa.companyAddress}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-muted-foreground">{moa.contactPerson}</span>
                            <span className="text-[11px] text-muted-foreground/60 font-medium">{moa.contactEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium">{moa.industryType}</TableCell>
                        <TableCell>{getStatusBadge(moa.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold text-muted-foreground border-border/60 bg-muted/10 px-3 py-1 rounded-lg">{moa.endorsedByCollege}</Badge>
                        </TableCell>
                        {!isStudent && (
                          <TableCell className="text-sm font-medium text-muted-foreground/80">
                            {moa.expiryDate ? new Date(moa.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </TableCell>
                        )}
                        <TableCell className="text-right px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-accent rounded-lg">
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl border-border/50 min-w-[160px]">
                              <DropdownMenuItem className="cursor-pointer rounded-lg py-2">
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              {user?.role === 'ADMIN' && (
                                <>
                                  <DropdownMenuSeparator className="my-1 opacity-50" />
                                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2">
                                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  {moa.isDeleted ? (
                                    <>
                                      <DropdownMenuItem 
                                        className="cursor-pointer text-green-600 rounded-lg py-2"
                                        onClick={() => handleRecover(moa)}
                                      >
                                        <ArchiveRestore className="mr-2 h-4 w-4" /> Recover
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="cursor-pointer text-destructive rounded-lg py-2"
                                        onClick={() => setDeleteConfirmId(moa.id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Hard Delete
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem 
                                      className="cursor-pointer text-destructive rounded-lg py-2"
                                      onClick={() => handleSoftDelete(moa)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Move to Bin
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isStudent ? 6 : 7} className="h-32 text-center text-muted-foreground font-medium">
                        No matching records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permanent Delete Confirmation placeholder - Implement actual hard delete in service if needed */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Permanent Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the agreement from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90 rounded-xl font-bold"
              onClick={() => setDeleteConfirmId(null)}
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}