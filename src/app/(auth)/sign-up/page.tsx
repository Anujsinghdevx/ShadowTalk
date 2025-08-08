'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import { useDebounceCallback } from 'usehooks-ts';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Loader2, UserPlus, AtSign, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';

import { UseToast } from '@/hooks/use-toast';
import { signUpSchema } from '@/schemas/signUpSchema';
import { ApiResponse } from '@/types/ApiResponse';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FormValues = z.infer<typeof signUpSchema>;

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Page() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const debounced = useDebounceCallback(setUsername, 500);
  const { toast } = UseToast();
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const form = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: '', email: '', password: '' },
    mode: 'onBlur',
  });

  // --- Username availability check ---
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (!username) return;
      try {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        const res = await axios.get(`/api/check-username-unique?username=${encodeURIComponent(username)}`);
        setUsernameMessage(res.data.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(axiosError.response?.data.message || 'Could not check username');
      } finally {
        setIsCheckingUsername(false);
      }
    };
    checkUsernameUnique();
  }, [username]);

  // --- Password strength (client hint only) ---
  const password = form.watch('password');
  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (password.length >= 12) s++;
    return Math.min(s, 5);
  }, [password]);

  const strengthLabel = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong', 'Excellent'][strength] || 'Too weak';
  const strengthColor =
    ['bg-red-500','bg-orange-500','bg-yellow-500','bg-lime-500','bg-green-500','bg-emerald-500'][strength] || 'bg-red-500';

  // --- Submit ---
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const emailRes = await axios.post('/api/send-verification', {
        email: data.email,
        username: data.username,
        otp: generatedOtp,
      });
      toast({ title: 'Verification email sent', description: emailRes.data.message });

      const res = await axios.post('/api/sign-up', data);
      toast({ title: 'Account created', description: res.data.message });

      router.replace(`/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-dvh overflow-x-clip" aria-label="Sign up">
        {/* Animated gradient background (no images) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#312e81_0%,#0b1021_45%,#000_100%)]"
        />
        {/* Subtle moving blobs */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
          animate={!prefersReduced ? { y: [0, 16, 0] } : {}}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[-4rem] h-96 w-96 rounded-full bg-violet-400/20 blur-3xl"
          animate={!prefersReduced ? { y: [0, -12, 0] } : {}}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Top chip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }}
          className="mx-auto w-full max-w-5xl px-4 pt-6 sm:pt-8 text-center text-white/85"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
            <Shield className="h-4 w-4" />
            <span className="text-[10px] xs:text-xs sm:text-sm">Private • Simple • Anonymous</span>
          </div>
        </motion.div>

        {/* Grid: form first on mobile */}
        <section className="mx-auto grid w-full max-w-5xl grid-cols-1 items-start md:items-center gap-8 sm:gap-10 px-4 py-8 sm:py-10 md:grid-cols-2">
          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
            className="order-1 rounded-2xl border border-white/10 bg-white/10 p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md"
          >
            <header className="mb-5 sm:mb-6 text-center">
              <h1 className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-semibold text-white">
                <UserPlus className="h-5 w-5 text-indigo-300" />
                Create your account
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-white/70">
                It only takes a minute.
              </p>
            </header>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                {/* Username */}
                <FormField
                  name="username"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base text-white/90">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                          <Input
                            autoComplete="username"
                            placeholder="yourname"
                            className="pl-9 bg-white text-gray-900 placeholder:text-gray-500"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              debounced(e.target.value.trim());
                            }}
                          />
                        </div>
                      </FormControl>
                      <div className="mt-1 flex items-center gap-2 text-[11px] sm:text-xs">
                        {isCheckingUsername ? (
                          <span className="inline-flex items-center gap-1 text-white/70">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking…
                          </span>
                        ) : usernameMessage ? (
                          <span
                            className={
                              usernameMessage.toLowerCase().includes('available')
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }
                          >
                            {usernameMessage}
                          </span>
                        ) : (
                          <span className="text-white/60">3–20 chars. Letters, numbers, underscores.</span>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base text-white/90">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                          <Input
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            placeholder="you@example.com"
                            className="pl-9 bg-white text-gray-900 placeholder:text-gray-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base text-white/90">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                          <Input
                            type={showPw ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className="pl-9 pr-10 bg-white text-gray-900 placeholder:text-gray-500"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-700 hover:text-gray-900"
                            aria-label={showPw ? 'Hide password' : 'Show password'}
                          >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>

                      {/* Strength meter */}
                      <div className="mt-2">
                        <div className="h-2 w-full rounded bg-white/20 overflow-hidden">
                          <div
                            className={`h-2 ${strengthColor} transition-all`}
                            style={{ width: `${(strength / 5) * 100}%` }}
                          />
                        </div>
                        <div className="mt-1 text-[11px] sm:text-xs text-white/70">
                          {password ? strengthLabel : 'Use at least 8 characters, mixing letters & numbers.'}
                        </div>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-white/80">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-medium text-indigo-200 underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>

            <p className="mt-3 text-center text-[10px] sm:text-[11px] text-white/50">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline decoration-white/40 underline-offset-2 hover:decoration-white">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline decoration-white/40 underline-offset-2 hover:decoration-white">
                Privacy Policy
              </Link>.
            </p>
          </motion.div>

          {/* Marketing copy (second on mobile, first on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.05 } }}
            className="order-2 md:order-1 text-white"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight supports-[text-wrap:balance]:text-balance">
              Join ShadowTalk
            </h2>
            <p className="mt-3 max-w-prose text-sm sm:text-base text-white/85 leading-relaxed">
              Create your inbox, share a link, and start getting honest feedback in minutes.
              Your identity stays private—always.
            </p>
            <ul className="mt-6 max-w-prose space-y-2 text-sm sm:text-base text-white/80">
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-indigo-400" />
                Free to start, upgrade anytime.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-indigo-400" />
                Abuse filtering and reporting built in.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-indigo-400" />
                Fast, mobile-first experience.
              </li>
            </ul>
          </motion.div>
        </section>

        {/* Bottom grid decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 sm:h-40 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]"
        />
      </main>
    </MotionConfig>
  );
}
