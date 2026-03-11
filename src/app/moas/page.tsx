"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/components/auth-context';
import { MOCK_MOAS } from '@/lib/mock-data';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit2, Trash2, ArchiveRestore } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';

export default function MOAListPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PROCESSING' | 'DELETED'>('ALL');

  const isStudent = user?.role === 'STUDENT';
  const searchTerm = searchParams.get('search') || '';

  const filteredMOAs = useMemo(() => {
    let list = MOCK_MOAS;

    // Role-based status filtering for students: Only see approved
    if (isStudent) {
      list = list.filter(m => m.status.startsWith('APPROVED') && !m.isDeleted);
    } else {
      // Admin/Faculty filtering
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

    // Search term filtering from URL
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
  }, [user, searchTerm, activeTab, isStudent]);

  const getStatusBadge = (status: string) => {
    if (status.startsWith('APPROVED')) return <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-100">Approved</Badge>;
    if (status.startsWith('PROCESSING')) return <Badge className="bg-blue-100 text-blue-800 border-none hover:bg-blue-100">Processing</Badge>;
    if (status === 'EXPIRED') return <Badge variant="destructive" className="border-none">Expired</Badge>;
    if (status === 'EXPIRING') return <Badge className="bg-orange-100 text-orange-800 border-none hover:bg-orange-100">Expiring</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Memorandum of Agreements</h1>
          <p className="text-muted-foreground">Manage and track all university partnerships.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add New MOA
          </Button>
        )}
      </div>

      <Card className="border-none shadow-sm">
        {!isStudent && (
          <div className="p-4 pb-0 flex justify-between items-center">
            <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/20">
              <Button 
                variant={activeTab === 'ALL' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('ALL')}
                className="text-xs h-8"
              >
                All
              </Button>
              <Button 
                variant={activeTab === 'ACTIVE' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('ACTIVE')}
                className="text-xs h-8"
              >
                Active
              </Button>
              <Button 
                variant={activeTab === 'PROCESSING' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('PROCESSING')}
                className="text-xs h-8"
              >
                Processing
              </Button>
              {user?.role === 'ADMIN' && (
                <Button 
                  variant={activeTab === 'DELETED' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveTab('DELETED')}
                  className="text-xs h-8"
                >
                  Recycle Bin
                </Button>
              )}
            </div>
          </div>
        )}
        <CardContent className="p-0 pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-primary">Company</TableHead>
                  <TableHead className="font-semibold text-primary">Contact Person</TableHead>
                  <TableHead className="font-semibold text-primary">Industry</TableHead>
                  <TableHead className="font-semibold text-primary">Status</TableHead>
                  <TableHead className="font-semibold text-primary">College</TableHead>
                  {!isStudent && <TableHead className="font-semibold text-primary">Expiry Date</TableHead>}
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMOAs.length > 0 ? (
                  filteredMOAs.map((moa) => (
                    <TableRow key={moa.id} className="hover:bg-accent/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{moa.companyName}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px] font-normal">{moa.companyAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-muted-foreground">{moa.contactPerson}</span>
                          <span className="text-xs text-muted-foreground/60">{moa.contactEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{moa.industryType}</TableCell>
                      <TableCell>{getStatusBadge(moa.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-muted-foreground border-muted-foreground/20">{moa.endorsedByCollege}</Badge>
                      </TableCell>
                      {!isStudent && (
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(moa.expiryDate).toLocaleDateString()}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {user?.role === 'ADMIN' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                {moa.isDeleted ? (
                                  <DropdownMenuItem className="cursor-pointer text-green-600">
                                    <ArchiveRestore className="mr-2 h-4 w-4" /> Recover
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="cursor-pointer text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                    <TableCell colSpan={isStudent ? 6 : 7} className="h-24 text-center text-muted-foreground">
                      No MOA records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
