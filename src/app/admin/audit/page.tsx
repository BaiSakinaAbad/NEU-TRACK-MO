"use client";

import React from 'react';
import { useAuth } from '@/components/auth-context';
import { MOCK_AUDIT_LOGS } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
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

  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Operation', 'MOA Target', 'Details'];
    const rows = MOCK_AUDIT_LOGS.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.operation,
      log.moaName,
      `"${log.details.replace(/"/g, '""')}"` // Escape quotes for CSV
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOpBadge = (op: string) => {
    switch(op) {
      case 'CREATE': return <Badge className="bg-green-100 text-green-800 border-none font-bold px-3 py-1 rounded-lg">CREATED</Badge>;
      case 'UPDATE': return <Badge className="bg-blue-100 text-blue-800 border-none font-bold px-3 py-1 rounded-lg">UPDATED</Badge>;
      case 'SOFT_DELETE': return <Badge className="bg-red-100 text-red-800 border-none font-bold px-3 py-1 rounded-lg">DELETED</Badge>;
      case 'RECOVER': return <Badge className="bg-purple-100 text-purple-800 border-none font-bold px-3 py-1 rounded-lg">RECOVERED</Badge>;
      default: return <Badge variant="outline" className="font-bold px-3 py-1 rounded-lg">{op}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Audit Trail</h1>
          <p className="text-muted-foreground mt-2 text-lg">Comprehensive log of all MOA modifications and administrative actions.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport}
          className="h-12 px-6 rounded-xl border-border/60 hover:bg-accent font-bold shadow-sm"
        >
          <Download className="mr-2 h-5 w-5" /> Export Logs
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-black/5 bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/50 hover:bg-muted/30">
                <TableHead className="font-bold text-primary py-5 px-6">Timestamp</TableHead>
                <TableHead className="font-bold text-primary py-5">User</TableHead>
                <TableHead className="font-bold text-primary py-5">Operation</TableHead>
                <TableHead className="font-bold text-primary py-5">MOA Target</TableHead>
                <TableHead className="font-bold text-primary py-5">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_AUDIT_LOGS.map((log) => (
                <TableRow key={log.id} className="hover:bg-accent/10 transition-colors border-b border-border/30">
                  <TableCell className="px-6 py-5 whitespace-nowrap text-sm font-medium text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-foreground">{log.userName}</div>
                  </TableCell>
                  <TableCell>{getOpBadge(log.operation)}</TableCell>
                  <TableCell className="font-bold text-primary">{log.moaName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate font-medium">
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
