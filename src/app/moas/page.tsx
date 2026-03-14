"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/components/auth-context';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit2, Trash2, ArchiveRestore, AlertTriangle, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';
import { softDeleteMOA, recoverMOA, createMOA, updateMOA } from '@/lib/moa-service';
import { MOA, MOAStatus, MOA_STATUS_LABELS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function MOAListPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PROCESSING' | 'DELETED'>('ALL');
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

  const moasQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, 'moas'), orderBy('updatedAt', 'desc'));
  }, [firestore, user]);

  const { data: moas, isLoading: isDataLoading } = useCollection<MOA>(moasQuery);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isStudent = user?.role === 'STUDENT';
  const isFacultyOrAdmin = user?.role === 'ADMIN' || user?.role === 'FACULTY';
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

  const handleAddMOA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Non-blocking write for optimistic UI
    createMOA(firestore, user, formData);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditMOA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMOA) return;
    
    // Non-blocking write for optimistic UI
    updateMOA(firestore, user, selectedMOA.id, formData);
    setIsEditDialogOpen(false);
    setSelectedMOA(null);
    resetForm();
  };

  const resetForm = () => {
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
  };

  const openViewDialog = (moa: MOA) => {
    setSelectedMOA(moa);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (moa: MOA) => {
    setSelectedMOA(moa);
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
  };

  const getStatusBadge = (status: string) => {
    if (status.startsWith('APPROVED')) return <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-100 font-bold px-3 py-1 rounded-lg">Approved</Badge>;
    if (status.startsWith('PROCESSING')) return <Badge className="bg-blue-100 text-blue-800 border-none hover:bg-blue-100 font-bold px-3 py-1 rounded-lg">Processing</Badge>;
    if (status === 'EXPIRED') return <Badge variant="destructive" className="border-none font-bold px-3 py-1 rounded-lg">Expired</Badge>;
    if (status === 'EXPIRING') return <Badge className="bg-orange-100 text-orange-800 border-none hover:bg-orange-100 font-bold px-3 py-1 rounded-lg">Expiring</Badge>;
    return <Badge variant="outline" className="font-bold px-3 py-1 rounded-lg">{status}</Badge>;
  };

  const MOASkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell className="px-6 py-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px] animate-skeleton" />
              <Skeleton className="h-3 w-[100px] animate-skeleton" />
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-4 w-[120px] animate-skeleton" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[100px] animate-skeleton" /></TableCell>
          <TableCell><Skeleton className="h-6 w-[80px] rounded-lg animate-skeleton" /></TableCell>
          <TableCell><Skeleton className="h-6 w-[60px] rounded-lg animate-skeleton" /></TableCell>
          {!isStudent && <TableCell><Skeleton className="h-4 w-[100px] animate-skeleton" /></TableCell>}
          <TableCell className="text-right px-6"><Skeleton className="h-8 w-8 rounded-lg ml-auto animate-skeleton" /></TableCell>
        </TableRow>
      ))}
    </>
  );

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
                <DialogDescription>
                  Enter the details of the partnership and Host Training Establishment (HTE).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMOA} className="space-y-6 py-4">
                <MOAFormFields formData={formData} setFormData={setFormData} />
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-12 bg-primary font-bold rounded-xl shadow-lg shadow-primary/20">
                    Register Agreement
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-xl shadow-black/5 bg-white rounded-2xl overflow-hidden">
        {!isStudent && (
          <div className="p-6 pb-0 flex justify-between items-center border-b border-border/50">
            <div className="flex items-center gap-2 border rounded-xl p-1 bg-muted/20 mb-6">
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
          <div className="overflow-x-auto">
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
                {isDataLoading || isAuthLoading ? (
                  <MOASkeleton />
                ) : filteredMOAs.length > 0 ? (
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
                            <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => openViewDialog(moa)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {isFacultyOrAdmin && (
                              <>
                                <DropdownMenuSeparator className="my-1 opacity-50" />
                                <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => openEditDialog(moa)}>
                                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                {moa.isDeleted ? (
                                  <>
                                    <DropdownMenuItem 
                                      className="cursor-pointer text-green-600 rounded-lg py-2"
                                      onSelect={() => recoverMOA(firestore, user!, moa)}
                                    >
                                      <ArchiveRestore className="mr-2 h-4 w-4" /> Recover
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-destructive rounded-lg py-2"
                                    onSelect={() => softDeleteMOA(firestore, user!, moa)}
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
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 opacity-20" />
                        No matching records found.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View/Edit Dialogs (unchanged structure, but used with non-blocking updates) */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => { setIsViewDialogOpen(open); if(!open) setSelectedMOA(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-primary">Agreement Details</DialogTitle>
              {selectedMOA && getStatusBadge(selectedMOA.status)}
            </div>
          </DialogHeader>
          {selectedMOA && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <DetailItem label="Company Name" value={selectedMOA.companyName} fullWidth />
                <DetailItem label="HTE ID / Reference" value={selectedMOA.hteId} />
                <DetailItem label="Industry Type" value={selectedMOA.industryType} />
                <DetailItem label="Address" value={selectedMOA.companyAddress} fullWidth />
                <DetailItem label="Contact Person" value={selectedMOA.contactPerson} />
                <DetailItem label="Contact Email" value={selectedMOA.contactEmail} />
                <DetailItem label="Effective Date" value={selectedMOA.effectiveDate} />
                <DetailItem label="Expiry Date" value={selectedMOA.expiryDate} />
                <DetailItem label="Endorsed College" value={selectedMOA.endorsedByCollege} />
                <DetailItem label="Status Label" value={MOA_STATUS_LABELS[selectedMOA.status]} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { resetForm(); setSelectedMOA(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Edit Agreement Record</DialogTitle>
            <DialogDescription>Update information for the Host Training Establishment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMOA} className="space-y-6 py-4">
            <MOAFormFields formData={formData} setFormData={setFormData} />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 bg-primary font-bold rounded-xl shadow-lg shadow-primary/20">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value, fullWidth = false }: { label: string, value: string | undefined, fullWidth?: boolean }) {
  return (
    <div className={`space-y-1 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{label}</Label>
      <div className="text-sm font-semibold text-foreground p-3 bg-muted/20 rounded-lg border border-border/40">
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
          placeholder="e.g. Acme Corp Philippines" 
          className="h-12 bg-muted/30 border-none"
          value={formData.companyName}
          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
          required 
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">HTE ID / Reference</Label>
        <Input 
          placeholder="HTE-2024-XXX" 
          className="h-12 bg-muted/30 border-none"
          value={formData.hteId}
          onChange={(e) => setFormData({...formData, hteId: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Industry Type</Label>
        <Input 
          placeholder="e.g. Technology" 
          className="h-12 bg-muted/30 border-none"
          value={formData.industryType}
          onChange={(e) => setFormData({...formData, industryType: e.target.value})}
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Company Address</Label>
        <Input 
          placeholder="Full business address" 
          className="h-12 bg-muted/30 border-none"
          value={formData.companyAddress}
          onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Contact Person</Label>
        <Input 
          placeholder="Authorized Representative" 
          className="h-12 bg-muted/30 border-none"
          value={formData.contactPerson}
          onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Contact Email</Label>
        <Input 
          type="email"
          placeholder="representative@company.com" 
          className="h-12 bg-muted/30 border-none"
          value={formData.contactEmail}
          onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Effective Date</Label>
        <Input 
          type="date"
          className="h-12 bg-muted/30 border-none"
          value={formData.effectiveDate}
          onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Expiry Date</Label>
        <Input 
          type="date"
          className="h-12 bg-muted/30 border-none"
          value={formData.expiryDate}
          onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">College Endorsement</Label>
        <Input 
          placeholder="e.g. CAS, CCS, CBA" 
          className="h-12 bg-muted/30 border-none"
          value={formData.endorsedByCollege}
          onChange={(e) => setFormData({...formData, endorsedByCollege: e.target.value})}
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Current Status</Label>
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