"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const { login, loginWithGoogle, user, error: authError } = useAuth();
  const router = useRouter();

  // If user becomes authenticated, redirect automatically
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setIsLoadingLocal(true);

    if (!email.endsWith('@neu.edu.ph')) {
      setLocalError('Only institutional @neu.edu.ph email accounts are allowed.');
      setIsLoadingLocal(false);
      return;
    }

    const response = await login(email, password);
    if (!response.success) {
      setLocalError(response.message || 'Invalid email or password. Please try again.');
      setIsLoadingLocal(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingLocal(true);
    setLocalError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      // Errors are surfaced through the AuthContext error state
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-body">
      <Card className="w-full max-w-md shadow-2xl border-none p-6 bg-white">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Track Mo</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            University Partnership Monitoring
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {activeError && (
              <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs whitespace-pre-wrap leading-relaxed">
                  {activeError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@neu.edu.ph" 
                className="bg-[#f8f9fa] border-none h-12 text-sm px-4 focus-visible:ring-1 focus-visible:ring-primary/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoadingLocal}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" title="Password" className="text-xs font-bold text-foreground">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="........"
                  className="bg-[#f8f9fa] border-none h-12 pr-12 text-sm px-4 focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoadingLocal}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90 rounded-lg shadow-sm mt-2" 
              type="submit" 
              disabled={isLoadingLocal}
            >
              {isLoadingLocal && !authError ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoadingLocal && !authError ? 'Processing...' : 'Log In with Email'}
            </Button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-muted/60"></div>
              <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">OR CONTINUE WITH</span>
              <div className="flex-grow border-t border-muted/60"></div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 bg-[#f8f9fa] border-none hover:bg-[#e8eaed] text-[#3c4043] font-semibold rounded-lg transition-colors flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              disabled={isLoadingLocal}
            >
              {isLoadingLocal && !authError ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {isLoadingLocal && !authError ? 'Processing...' : 'Log in with Google'}
            </Button>
          </CardContent>
          <CardFooter className="pt-2 flex justify-center">
            <p className="text-[13px] text-muted-foreground">
              Only accounts with <span className="text-[#5f6368] font-medium underline underline-offset-4 decoration-muted/50">@neu.edu.ph</span> are permitted.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
