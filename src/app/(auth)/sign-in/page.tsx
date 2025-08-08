"use client";

import React, { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/schemas/signInSchema";
import { UseToast } from "@/hooks/use-toast";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, Shield } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Page() {
  const { toast } = UseToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const prefersReduced = useReducedMotion();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
      callbackUrl: "/dashboard",
    });
    setIsLoading(false);

    if (result?.error) {
      toast({
        title: "Sign-in failed",
        description: "Double-check your details and try again.",
        variant: "destructive",
      });
      return;
    }
    if (result?.url) window.location.href = result.url;
  };

  return (
    <MotionConfig reducedMotion="user">
      <main
        className="relative min-h-dvh overflow-x-clip" // allow vertical scroll on mobile
        aria-label="Sign in"
      >
        {/* Background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#312e81_0%,#0b1021_45%,#000_100%)]"
        />
        {/* Subtle blobs */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
          animate={!prefersReduced ? { y: [0, 16, 0] } : {}}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[-4rem] h-96 w-96 rounded-full bg-violet-400/20 blur-3xl"
          animate={!prefersReduced ? { y: [0, -12, 0] } : {}}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Chip */}
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

        {/* Grid container */}
        <section className="mx-auto grid w-full max-w-5xl grid-cols-1 items-start md:items-center gap-8 sm:gap-10 px-4 py-8 sm:py-10 md:grid-cols-2">
          {/* FORM FIRST on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
            className="order-1 md:order-2 rounded-2xl border border-white/10 bg-white/10 p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md"
          >
            <header className="mb-5 sm:mb-6 text-center">
              <h2 className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-semibold text-white">
                <LogIn className="h-5 w-5 text-indigo-300" />
                Sign in to your inbox
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-white/70">
                Enter your details to continue.
              </p>
            </header>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                {/* Identifier */}
                <FormField
                  name="identifier"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base text-white/90">Email or username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                          <Input
                            autoComplete="username"
                            inputMode="email"
                            placeholder="you@example.com"
                            className="pl-9 bg-white text-gray-900 placeholder:text-gray-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <p className="mt-1 text-[11px] sm:text-xs text-white/60">
                        Use the email you signed up with, or your username.
                      </p>
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
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                          <Input
                            type={showPw ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="pl-9 pr-10 bg-white text-gray-900 placeholder:text-gray-500"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-700 hover:text-gray-900"
                            aria-label={showPw ? "Hide password" : "Show password"}
                          >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs text-white/60">
                        <span>At least 8 characters recommended.</span>
                        <Link href="/forgot-password" className="text-indigo-200 hover:underline">
                          Forgot?
                        </Link>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign in
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-white/80">
              New to ShadowTalk?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-indigo-200 underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </div>

            <p className="mt-3 text-center text-[10px] sm:text-[11px] text-white/50">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline decoration-white/40 underline-offset-2 hover:decoration-white">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline decoration-white/40 underline-offset-2 hover:decoration-white">
                Privacy Policy
              </Link>.
            </p>
          </motion.div>

          {/* Left copy SECOND on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.05 } }}
            className="order-2 md:order-1 text-white"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight supports-[text-wrap:balance]:text-balance">
              Welcome back to ShadowTalk
            </h1>
            <p className="mt-3 max-w-prose text-sm sm:text-base text-white/85 leading-relaxed">
              Pick up where you left off. Read new messages, reply when you want,
              and keep the feedback loop moving.
            </p>
            <ul className="mt-6 max-w-prose space-y-2 text-sm sm:text-base text-white/80">
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-indigo-400" />
                Candid feedback without awkwardness.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-indigo-400" />
                Filters and moderation, built in.
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
