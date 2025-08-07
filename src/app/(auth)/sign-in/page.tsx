"use client";

import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { signInSchema } from '@/schemas/signInSchema';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UseToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';

const Page: React.FC = () => {
  const { toast } = UseToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
      callbackUrl: '/dashboard',
    });
    setIsLoading(false);

    if (result?.error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <main
      className="flex justify-center items-center min-h-screen bg-gray-100 px-4"
      style={{
        backgroundImage: 'url(/msg.avif)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        boxSizing: 'border-box',
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl shadow-black"
      >
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-gray-900 flex items-center justify-center gap-2">
            <LogIn className="w-6 h-6 text-blue-600" /> Join Shadow Talk
          </h1>
          <p className="text-gray-700 text-sm md:text-base">
            Sign in to start your anonymous adventure
          </p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> Email or Username
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email or username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Password
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </Button>
          </form>
        </Form>

        <footer className="text-center text-sm text-gray-600 mt-4">
          New user?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline font-medium">
            Sign up here
          </Link>
        </footer>
      </motion.section>
    </main>
  );
};

export default Page;
