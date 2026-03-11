"use client";

import React, { useMemo, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { MOCK_MOAS } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileCheck, FileClock, FileWarning, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      router.push('/moas');
    }
  }, [user, router]);

  const stats = useMemo(() => {
    const active = MOCK_MOAS.filter(m => m.status.startsWith('APPROVED') && !m.isDeleted).length;
    const processing = MOCK_MOAS.filter(m => m.status.startsWith('PROCESSING') && !m.isDeleted).length;
    const expired = MOCK_MOAS.filter(m => m.status === 'EXPIRED' && !m.isDeleted).length;
    const expiring = MOCK_MOAS.filter(m => m.status === 'EXPIRING' && !m.isDeleted).length;

    return { active, processing, expired, expiring };
  }, []);

  const chartData = [
    { name: 'Active', count: stats.active, color: 'hsl(var(--primary))' },
    { name: 'Processing', count: stats.processing, color: '#30E8DD' },
    { name: 'Expiring', count: stats.expiring, color: '#F59E0B' },
    { name: 'Expired', count: stats.expired, color: '#EF4444' },
  ];

  const collegeData = [
    { name: 'CAS', value: 12 },
    { name: 'CCS', value: 19 },
    { name: 'CBA', value: 8 },
    { name: 'CED', value: 5 },
    { name: 'CHM', value: 15 },
  ];

  if (user?.role === 'STUDENT') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Overview</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}. Here is what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active MOAs</CardTitle>
            <FileCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <FileClock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">4 awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <FileWarning className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.expiring}</div>
            <p className="text-xs text-muted-foreground">Within next 60 days</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Partners</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Across all colleges</p>
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
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
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
            <CardTitle className="text-lg">Top Colleges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {collegeData.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-bold text-muted-foreground">{item.name}</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all" 
                      style={{ width: `${(item.value / 20) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
