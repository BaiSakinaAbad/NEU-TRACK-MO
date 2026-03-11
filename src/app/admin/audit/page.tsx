"use client";

import React from 'react';
import { useAuth } from '@/components/auth-context';
import { MOCK_AUDIT_LOGS } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AuditTrailPage() {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive font-semibold">Access Denied: Administrative privileges required.</p>
      </div>
    );
  }

  const getOpBadge = (op: string) => {
    switch(op) {
      case 'CREATE': return <Badge className="bg-green-100 text-green-800 border-none">CREATED</Badge>;
      case 'UPDATE': return <Badge className="bg-blue-100 text-blue-800 border-none">UPDATED</Badge>;
      case 'SOFT_DELETE': return <Badge className="bg-red-100 text-red-800 border-none">DELETED</Badge>;
      case 'RECOVER': return <Badge className="bg-purple-100 text-purple-800 border-none">RECOVERED</Badge>;
      default: return <Badge variant="outline">{op}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Audit Trail</h1>
          <p className="text-muted-foreground">Comprehensive log of all MOA modifications and administrative actions.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Logs
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs by user or company..." className="pl-9" />
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Operation</TableHead>
                <TableHead className="font-semibold">MOA Target</TableHead>
                <TableHead className="font-semibold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_AUDIT_LOGS.map((log) => (
                <TableRow key={log.id} className="hover:bg-accent/30 transition-colors">
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{log.userName}</div>
                  </TableCell>
                  <TableCell>{getOpBadge(log.operation)}</TableCell>
                  <TableCell className="font-medium">{log.moaName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {log.details}
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