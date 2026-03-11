"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/components/auth-context';
import { MOCK_MOAS } from '@/lib/mock-data';
import { MOA_STATUS_LABELS } from '@/lib/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, MoreVertical, Eye, Edit2, Trash2, ArchiveRestore } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export default function MOAListPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PROCESSING' | 'DELETED'>('ALL');

  const filteredMOAs = useMemo(() => {
    let list = MOCK_MOAS;

    // Soft delete filtering
    if (user?.role !== 'ADMIN') {
      list = list.filter(m => !m.isDeleted);
    } else if (activeTab === 'DELETED') {
      list = list.filter(m => m.isDeleted);
    } else if (activeTab !== 'ALL') {
      list = list.filter(m => !m.isDeleted);
    }

    // Role-based status filtering for students
    if (user?.role === 'STUDENT') {
      list = list.filter(m => m.status.startsWith('APPROVED'));
    }

    // Search term filtering
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
  }, [user, searchTerm, activeTab]);

  const getStatusBadge = (status: string) => {
    if (status.startsWith('APPROVED')) return <Badge className="bg-green-100 text-green-800 border-none">Approved</Badge>;
    if (status.startsWith('PROCESSING')) return <Badge className="bg-blue-100 text-blue-800 border-none">Processing</Badge>;
    if (status === 'EXPIRED') return <Badge variant="destructive" className="border-none">Expired</Badge>;
    if (status === 'EXPIRING') return <Badge className="bg-orange-100 text-orange-800 border-none">Expiring</Badge>;
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
        <CardHeader className="p-4 pb-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
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
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search partnerships..." 
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-primary">Company</TableHead>
                  <TableHead className="font-semibold text-primary">Contact Person</TableHead>
                  <TableHead className="font-semibold text-primary">Industry</TableHead>
                  <TableHead className="font-semibold text-primary">Status</TableHead>
                  <TableHead className="font-semibold text-primary">College</TableHead>
                  {user?.role !== 'STUDENT' && <TableHead className="font-semibold text-primary">Expiry Date</TableHead>}
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
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{moa.companyAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{moa.contactPerson}</span>
                          <span className="text-xs text-muted-foreground">{moa.contactEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>{moa.industryType}</TableCell>
                      <TableCell>{getStatusBadge(moa.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">{moa.endorsedByCollege}</Badge>
                      </TableCell>
                      {user?.role !== 'STUDENT' && (
                        <TableCell className="text-sm">
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
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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