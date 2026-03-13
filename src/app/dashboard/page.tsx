"use client";

import React, { useMemo, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileCheck, FileClock, FileWarning, Briefcase, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MOA } from '@/lib/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const moasQuery = useMemo(() => query(collection(firestore, 'moas')), [firestore]);
  const { data: moas, isLoading } = useCollection<MOA>(moasQuery);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      router.push('/moas');
    }
  }, [user, router]);

  const stats = useMemo(() => {
    if (!moas) return { active: 0, processing: 0, expired: 0, expiring: 0, totalPartners: 0 };
    
    const active = moas.filter(m => m.status.startsWith('APPROVED') && !m.isDeleted).length;
    const processing = moas.filter(m => m.status.startsWith('PROCESSING') && !m.isDeleted).length;
    const expired = moas.filter(m => m.status === 'EXPIRED' && !m.isDeleted).length;
    const expiring = moas.filter(m => m.status === 'EXPIRING' && !m.isDeleted).length;
    const totalPartners = Array.from(new Set(moas.map(m => m.companyName))).length;

    return { active, processing, expired, expiring, totalPartners };
  }, [moas]);

  const chartData = [
    { name: 'Active', count: stats.active, color: 'hsl(var(--primary))' },
    { name: 'Processing', count: stats.processing, color: '#30E8DD' },
    { name: 'Expiring', count: stats.expiring, color: '#F59E0B' },
    { name: 'Expired', count: stats.expired, color: '#EF4444' },
  ];

  const collegeStats = useMemo(() => {
    if (!moas) return [];
    const counts: Record<string, number> = {};
    moas.filter(m => !m.isDeleted).forEach(m => {
      counts[m.endorsedByCollege] = (counts[m.endorsedByCollege] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [moas]);

  if (user?.role === 'STUDENT') return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Overview</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}. Real-time monitoring enabled.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active MOAs</CardTitle>
            <FileCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently approved agreements</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <FileClock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval steps</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <FileWarning className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.expiring}</div>
            <p className="text-xs text-muted-foreground">Review required</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Partners</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">Across the university</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">MOA Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">College Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {collegeStats.length > 0 ? (
                collegeStats.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-bold text-muted-foreground">{item.name}</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (item.value / (moas?.length || 1)) * 200)}%` }}
                      />
                    </div>
                    <div className="text-sm font-semibold">{item.value}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
