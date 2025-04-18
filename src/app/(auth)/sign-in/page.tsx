'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { UseToast } from '@/hooks/use-toast'; // ✅ Kept as YOU wrote it

const Page: React.FC = () => {
  const { toast } = UseToast(); // ✅ No change
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    }

    if (result?.url) {
      router.replace('/dashboard');
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gray-100 px-4"
      style={{
        backgroundImage: 'url(/msg.avif)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl shadow-black ">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-gray-900">
            Join Shadow Talk
          </h1>
          <p className="text-gray-700 text-sm md:text-base">
            Sign in to start your anonymous adventure
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Sign In
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-gray-600 mt-4">
          New user?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline font-medium">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;

