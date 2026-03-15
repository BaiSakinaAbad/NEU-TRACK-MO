"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GraduationCap, Landmark, Loader2, Radar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COLLEGES = [
  { value: 'SGS', label: 'School of Graduate Studies' },
  { value: 'LAW', label: 'College of Law' },
  { value: 'MED', label: 'College of Medicine' },
  { value: 'COA', label: 'College of Accountancy' },
  { value: 'COAg', label: 'College of Agriculture' },
  { value: 'CAS', label: 'College of Arts and Sciences' },
  { value: 'CBA', label: 'College of Business Administration' },
  { value: 'COC', label: 'College of Communication' },
  { value: 'CICS', label: 'College of Informatics and Computing Studies' },
  { value: 'CCrim', label: 'College of Criminology' },
  { value: 'CED', label: 'College of Education' },
  { value: 'CET', label: 'College of Engineering and Technology' },
  { value: 'CMT', label: 'College of Medical Technology' },
  { value: 'COMid', label: 'College of Midwifery' },
  { value: 'COMus', label: 'College of Music' },
  { value: 'CON', label: 'College of Nursing' },
  { value: 'CRT', label: 'College of Respiratory Therapy' },
  { value: 'SIR', label: 'School of International Relations' },
  { value: 'OTHER', label: 'Other' },
];

export default function OnboardingPage() {
  const { user, isLoading: isAuthLoading, updateUser } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.college) {
        router.push('/');
      } else if (user.role === 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege || !user) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(firestore, 'users', user.id);
      await updateDoc(userRef, {
        college: selectedCollege,
        updatedAt: new Date().toISOString()
      });

      // Update local state to reflect the change immediately
      updateUser({ ...user, college: selectedCollege });
      
      toast({
        title: "Profile Updated",
        description: "Welcome! Your college department has been set successfully.",
      });

      router.push('/');
    } catch (error) {
      console.error("Error updating college:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error saving your department. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-none p-2 bg-white rounded-3xl overflow-hidden">
        <div className="bg-primary p-8 text-white flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
            <Radar className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Complete Your Profile</CardTitle>
            <CardDescription className="text-white/80 text-lg mt-2 font-medium">
              Help us personalize your Track Mo experience.
            </CardDescription>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl border border-border/40">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                {user.role === 'STUDENT' ? <GraduationCap className="w-6 h-6 text-primary" /> : <Landmark className="w-6 h-6 text-primary" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Verification Requirement</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  As a {user.role.toLowerCase()}, you are required to select your primary college department to access MOA records and university features.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="college" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Select Your College
              </Label>
              <Select value={selectedCollege} onValueChange={setSelectedCollege} required>
                <SelectTrigger id="college" className="h-14 bg-muted/30 border-none rounded-2xl px-6 text-base font-semibold focus:ring-2 focus:ring-primary/10 transition-all text-left">
                  <SelectValue placeholder="Choose from the list..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-2 border-border/50 shadow-2xl max-h-[400px]">
                  {COLLEGES.map((college) => (
                    <SelectItem key={college.value} value={college.value} className="rounded-xl py-3 font-medium text-sm">
                      {college.label} ({college.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="p-8 pt-0">
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
              disabled={!selectedCollege || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                'Finalize Registration'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
