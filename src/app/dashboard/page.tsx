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
  const { user, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const moasQuery = useMemo(() => {
    if (!user || user.role === 'STUDENT') return null;
    return query(collection(firestore, 'moas'));
  }, [firestore, user]);

  const { data: moas, isLoading: isDataLoading } = useCollection<MOA>(moasQuery);

  useEffect(() => {
    if (!isAuthLoading && user?.role === 'STUDENT') {
      router.push('/moas');
    }
  }, [user, isAuthLoading, router]);

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

  if (isAuthLoading || (user && user.role !== 'STUDENT' && isDataLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role === 'STUDENT') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-2 text-lg">Here is a real-time overview of the university's partnership monitoring status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active MOAs</CardTitle>
            <FileCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-primary">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently approved agreements</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Processing</CardTitle>
            <FileClock className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-secondary">{stats.processing}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval steps</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Expiring Soon</CardTitle>
            <FileWarning className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-orange-500">{stats.expiring}</div>
            <p className="text-xs text-muted-foreground mt-1">Renewal review required</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Unique Partners</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all college departments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-xl shadow-black/5 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="text-lg font-bold text-primary">MOA Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} fontWeight="bold" />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} fontWeight="bold" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-xl shadow-black/5 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="text-lg font-bold text-primary">Top Participating Colleges</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {collegeStats.length > 0 ? (
                collegeStats.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-16 text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.name}</div>
                    <div className="flex-1 h-3 bg-muted/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(100, (item.value / (moas?.length || 1)) * 100)}%` }}
                      />
                    </div>
                    <div className="text-sm font-extrabold text-primary">{item.value}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <p className="font-bold text-lg">No college data available</p>
                  <p className="text-sm">Statistics will appear as MOAs are registered.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
