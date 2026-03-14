
"use client";

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, Info, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditLog } from '@/lib/types';

const INITIAL_LIMIT = 50;

export default function AuditTrailPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  
  const logsQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, 'audit_logs'), 
      orderBy('timestamp', 'desc'), 
      limit(displayLimit + 1)
    );
  }, [firestore, displayLimit]);

  const { data: logs, isLoading } = useCollection<AuditLog>(logsQuery);
  
  const hasMore = logs.length > displayLimit;
  const displayLogs = logs.slice(0, displayLimit);

  const loadMore = useCallback(() => {
    setDisplayLimit(prev => prev + INITIAL_LIMIT);
  }, []);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive font-semibold">Access Denied: Administrative privileges required.</p>
      </div>
    );
  }

  const handleExport = () => {
    if (!logs) return;
    const headers = ['Timestamp', 'User', 'Operation', 'MOA Target', 'Details'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.operation,
      log.moaName,
      `"${log.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
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
          <p className="text-muted-foreground mt-2 text-lg">Comprehensive log of administrative actions.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={!logs || logs.length === 0}
          className="h-12 px-6 rounded-xl border-border/60 hover:bg-accent font-bold shadow-sm"
        >
          <Download className="mr-2 h-5 w-5" /> Export All Loaded
        </Button>
      </div>

      <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
        <Info className="h-4 w-4" />
        <span>System Stability: Showing {displayLogs.length} most recent entries. Data is cached locally for faster access.</span>
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
              {isLoading && displayLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground font-medium">Synchronizing logs...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {displayLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-accent/10 transition-colors border-b border-border/30">
                      <TableCell className="px-6 py-5 whitespace-nowrap text-sm font-medium text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
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
                  {displayLogs.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                        No logs available yet.
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
          {hasMore && (
            <div className="p-4 border-t border-border/40 flex justify-center bg-muted/5">
              <Button 
                variant="ghost" 
                onClick={loadMore} 
                className="text-primary font-bold hover:bg-primary/10 transition-all rounded-xl gap-2"
              >
                <ChevronDown className="h-4 w-4" /> Load Older Logs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
