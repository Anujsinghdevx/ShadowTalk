"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ShieldCheck,Loader2, Shield, ArrowLeft } from "lucide-react";

import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { UseToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;
const OTP_LENGTH = 6;
// Change if your resend endpoint differs:
const RESEND_ENDPOINT = (username: string) => `/api/resend-code/${username}`;

type VerifyValues = z.infer<typeof verifySchema>;

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = UseToast();
  const prefersReduced = useReducedMotion();

  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const form = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  // Tie segmented OTP -> form value
  useEffect(() => {
    form.setValue("code", otp.join(""), { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Simple cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const onSubmit = async (data: VerifyValues) => {
    if (!params?.username) return;
    setIsVerifying(true);
    try {
      const response = await axios.post<ApiResponse>(
        `/api/verify-code/${params.username}`,
        data
      );
      toast({ title: "Verified", description: response.data.message });
      router.replace("/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification failed",
        description:
          axiosError.response?.data.message || "Please check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(0, 1);
    setOtp((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!paste) return;
    e.preventDefault();
    const chars = paste.split("");
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < OTP_LENGTH; i++) next[i] = chars[i] || "";
      return next;
    });
    inputsRef.current[Math.min(chars.length, OTP_LENGTH) - 1]?.focus();
  };

  const resend = async () => {
    if (!params?.username) return;
    try {
      setCooldown(30); // 30s cooldown
      const res = await axios.post<ApiResponse>(RESEND_ENDPOINT(params.username));
      toast({ title: "Code sent", description: res.data.message });
    } catch (error) {
      setCooldown(0);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Resend failed",
        description: axiosError.response?.data.message || "Try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const usernameLabel = useMemo(
    () => (params?.username ? `@${params.username}` : "your account"),
    [params?.username]
  );

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-dvh overflow-x-clip" aria-label="Verify account">
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

        {/* Top chip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }}
          className="mx-auto w-full max-w-5xl px-4 pt-6 sm:pt-8 text-center text-white/85"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
            <Shield className="h-4 w-4" />
            <span className="text-[10px] xs:text-xs sm:text-sm">
              Secure verification • Takes seconds
            </span>
          </div>
        </motion.div>

        {/* Card */}
        <section className="mx-auto grid w-full max-w-xl grid-cols-1 items-start gap-6 px-4 py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
            className="rounded-2xl border border-white/10 bg-white/10 p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md"
          >
            <header className="mb-5 sm:mb-6 text-center">
              <h1 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-semibold text-white supports-[text-wrap:balance]:text-balance">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                Verify your account
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-white/75">
                Enter the 6-digit code we sent to {usernameLabel}.
              </p>
            </header>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                {/* Hidden field actually submitted */}
                <FormField
                  name="code"
                  control={form.control}
                  render={({ }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Verification code</FormLabel>
                      <FormControl>
                        {/* OTP segmented inputs */}
                        <div className="flex justify-center gap-2 sm:gap-3">
                          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                            <Input
                              key={i}
                              ref={(el) => { inputsRef.current[i] = el; }}
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              aria-label={`Digit ${i + 1}`}
                              pattern="[0-9]*"
                              maxLength={1}
                              value={otp[i] || ""}
                              onChange={(e) => handleChange(i, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(i, e)}
                              onPaste={handlePaste}
                              className="h-12 w-10 sm:h-14 sm:w-12 text-center text-lg sm:text-2xl bg-white text-gray-900"
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <Button
                    type="submit"
                    disabled={isVerifying || otp.join("").length !== OTP_LENGTH}
                    className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-sm sm:text-base"
                  >
                    {isVerifying ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Submit code
                      </span>
                    )}
                  </Button>

                  <div className="text-xs sm:text-sm text-white/80">
                    Didn’t get a code?{" "}
                    <button
                      type="button"
                      onClick={resend}
                      disabled={cooldown > 0}
                      className="underline decoration-white/40 underline-offset-4 hover:decoration-white disabled:opacity-50"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                    </button>
                  </div>

                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </form>
            </Form>
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
