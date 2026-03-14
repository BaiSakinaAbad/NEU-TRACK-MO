"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit2, Trash2, ArchiveRestore, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';
import { softDeleteMOA, recoverMOA, createMOA, updateMOA } from '@/lib/moa-service';
import { MOA, MOAStatus, MOA_STATUS_LABELS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const INITIAL_BATCH = 25;

export default function MOAListPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PROCESSING' | 'DELETED'>('ALL');
  const [displayLimit, setDisplayLimit] = useState(INITIAL_BATCH);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMOA, setSelectedMOA] = useState<MOA | null>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    hteId: '',
    companyAddress: '',
    contactPerson: '',
    contactEmail: '',
    industryType: '',
    effectiveDate: '',
    expiryDate: '',
    status: 'PROCESSING_PARTNER' as MOAStatus,
    endorsedByCollege: '',
  });

  // Stabilized query to prevent render loops
  const moasQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'moas'), 
      orderBy('updatedAt', 'desc'), 
      limit(displayLimit + 1)
    );
  }, [firestore, user?.id, displayLimit]);

  const { data: moas, isLoading: isDataLoading } = useCollection<MOA>(moasQuery);
  
  const hasMore = moas.length > displayLimit;
  const displayMOAs = moas.slice(0, displayLimit);

  const isStudent = user?.role === 'STUDENT';
  const isFacultyOrAdmin = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const searchTerm = searchParams.get('search') || '';

  const filteredMOAs = useMemo(() => {
    let list = displayMOAs;
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
        m.industryType.toLowerCase().includes(term)
      );
    }
    return list;
  }, [user?.role, searchTerm, activeTab, isStudent, displayMOAs]);

  const resetForm = useCallback(() => {
    setFormData({
      companyName: '',
      hteId: '',
      companyAddress: '',
      contactPerson: '',
      contactEmail: '',
      industryType: '',
      effectiveDate: '',
      expiryDate: '',
      status: 'PROCESSING_PARTNER',
      endorsedByCollege: '',
    });
  }, []);

  // DECOUPLING FIX: Use setTimeout to ensure Dropdown closes before Dialog opens
  const handleAction = useCallback((action: 'view' | 'edit', moa: MOA) => {
    setTimeout(() => {
      setSelectedMOA(moa);
      if (action === 'view') {
        setIsViewDialogOpen(true);
      } else {
        setFormData({
          companyName: moa.companyName,
          hteId: moa.hteId || '',
          companyAddress: moa.companyAddress || '',
          contactPerson: moa.contactPerson || '',
          contactEmail: moa.contactEmail || '',
          industryType: moa.industryType || '',
          effectiveDate: moa.effectiveDate || '',
          expiryDate: moa.expiryDate || '',
          status: moa.status,
          endorsedByCollege: moa.endorsedByCollege || '',
        });
        setIsEditDialogOpen(true);
      }
    }, 0);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status.startsWith('APPROVED')) return <Badge className="bg-green-100 text-green-800 border-none font-bold px-3 py-1 rounded-lg">Approved</Badge>;
    if (status.startsWith('PROCESSING')) return <Badge className="bg-blue-100 text-blue-800 border-none font-bold px-3 py-1 rounded-lg">Processing</Badge>;
    if (status === 'EXPIRED') return <Badge variant="destructive" className="border-none font-bold px-3 py-1 rounded-lg">Expired</Badge>;
    if (status === 'EXPIRING') return <Badge className="bg-orange-100 text-orange-800 border-none font-bold px-3 py-1 rounded-lg">Expiring</Badge>;
    return <Badge variant="outline" className="font-bold px-3 py-1 rounded-lg">{status}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Memorandum of Agreements</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage and track all university partnerships.</p>
        </div>
        
        {isFacultyOrAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold">
                <Plus className="mr-2 h-5 w-5" /> Add New MOA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">New Agreement Record</DialogTitle>
                <DialogDescription>Enter the details of the partnership.</DialogDescription>
              </DialogHeader>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  createMOA(firestore, user!, formData);
                  setIsAddDialogOpen(false);
                  toast({ title: "Success", description: "MOA registration initiated." });
                }} 
                className="space-y-6 py-4"
              >
                <MOAFormFields formData={formData} setFormData={setFormData} />
                <DialogFooter>
                  <Button type="submit" className="w-full h-12 bg-primary font-bold rounded-xl">Register Agreement</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-xl shadow-black/5 bg-white rounded-2xl overflow-hidden">
        {!isStudent && (
          <div className="p-6 pb-0 border-b border-border/50">
            <div className="flex items-center gap-2 border rounded-xl p-1 bg-muted/20 w-fit mb-6">
              {['ALL', 'ACTIVE', 'PROCESSING', 'DELETED'].map((tab) => {
                if (tab === 'DELETED' && user?.role !== 'ADMIN') return null;
                return (
                  <Button 
                    key={tab}
                    variant={activeTab === tab ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveTab(tab as any)}
                    className={`text-xs h-9 px-4 rounded-lg transition-all ${activeTab === tab ? 'shadow-sm font-bold' : ''}`}
                  >
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/50">
                <TableHead className="font-bold text-primary py-5 px-6">Company</TableHead>
                <TableHead className="font-bold text-primary py-5">Industry</TableHead>
                <TableHead className="font-bold text-primary py-5">Status</TableHead>
                <TableHead className="font-bold text-primary py-5">College</TableHead>
                <TableHead className="text-right px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDataLoading ? (
                [1,2,3].map(i => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-5"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right px-6"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredMOAs.map((moa) => (
                <TableRow key={moa.id} className="hover:bg-accent/10 transition-colors border-b border-border/30">
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{moa.companyName}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">{moa.companyAddress}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">{moa.industryType}</TableCell>
                  <TableCell>{getStatusBadge(moa.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold text-muted-foreground border-border/60">{moa.endorsedByCollege}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-accent rounded-lg">
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl min-w-[160px]">
                        <DropdownMenuItem onSelect={() => handleAction('view', moa)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {isFacultyOrAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleAction('edit', moa)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={moa.isDeleted ? 'text-green-600' : 'text-destructive'}
                              onSelect={() => {
                                if (moa.isDeleted) recoverMOA(firestore, user!, moa);
                                else softDeleteMOA(firestore, user!, moa);
                                toast({ title: "Updated", description: "Record status changed." });
                              }}
                            >
                              {moa.isDeleted ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                              {moa.isDeleted ? 'Recover' : 'Move to Bin'}
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
          {hasMore && (
            <div className="p-4 flex justify-center bg-muted/5 border-t">
              <Button variant="ghost" onClick={() => setDisplayLimit(d => d + INITIAL_BATCH)} className="gap-2">
                <ChevronDown className="h-4 w-4" /> Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VIEW DIALOG */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Agreement Details</DialogTitle>
          </DialogHeader>
          {selectedMOA && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <DetailItem label="Company Name" value={selectedMOA.companyName} fullWidth />
              <DetailItem label="Industry" value={selectedMOA.industryType} />
              <DetailItem label="College" value={selectedMOA.endorsedByCollege} />
              <DetailItem label="Status" value={MOA_STATUS_LABELS[selectedMOA.status]} fullWidth />
              <DetailItem label="Address" value={selectedMOA.companyAddress} fullWidth />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Edit Agreement</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              updateMOA(firestore, user!, selectedMOA!.id, formData);
              setIsEditDialogOpen(false);
              toast({ title: "Success", description: "Record updated." });
            }} 
            className="space-y-6 py-4"
          >
            <MOAFormFields formData={formData} setFormData={setFormData} />
            <DialogFooter>
              <Button type="submit" className="w-full h-12 bg-primary font-bold rounded-xl">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value, fullWidth = false }: { label: string, value: string | undefined, fullWidth?: boolean }) {
  return (
    <div className={`space-y-1 ${fullWidth ? 'col-span-2' : ''}`}>
      <Label className="text-[10px] font-bold uppercase text-muted-foreground">{label}</Label>
      <div className="text-sm font-semibold p-3 bg-muted/20 rounded-lg border border-border/40">
        {value || '—'}
      </div>
    </div>
  );
}

function MOAFormFields({ formData, setFormData }: { formData: any, setFormData: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 col-span-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Company Name</Label>
        <Input 
          className="h-12 bg-muted/30 border-none"
          value={formData.companyName}
          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
          required 
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Company Address</Label>
        <Input 
          className="h-12 bg-muted/30 border-none"
          value={formData.companyAddress}
          onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Industry</Label>
        <Input 
          className="h-12 bg-muted/30 border-none"
          value={formData.industryType}
          onChange={(e) => setFormData({...formData, industryType: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">College</Label>
        <Input 
          className="h-12 bg-muted/30 border-none"
          value={formData.endorsedByCollege}
          onChange={(e) => setFormData({...formData, endorsedByCollege: e.target.value})}
          required
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(v: MOAStatus) => setFormData({...formData, status: v})}
        >
          <SelectTrigger className="h-12 bg-muted/30 border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MOA_STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
