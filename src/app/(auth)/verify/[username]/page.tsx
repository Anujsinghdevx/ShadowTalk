'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';

import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { UseToast } from '@/hooks/use-toast'; // ✅ No changes

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const VerifyAccount: React.FC = () => {
  const router = useRouter();
  const param = useParams<{ username: string }>();
  const { toast } = UseToast(); // ✅ No changes

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post(`/api/verify-code/${param.username}`, data);
      toast({
        title: '✅ Success',
        description: response.data.message,
      });
      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: '❌ Error',
        description: axiosError.response?.data.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gray-100 px-4"
      style={{
        backgroundImage: 'url(/msg.avif)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md p-8 bg-white  rounded-xl shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
            Verify Your Account
          </h1>
          <p className="text-sm text-gray-700">
            Enter the verification code sent to your email
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter code here" {...field} />
                  </FormControl>
                  <FormDescription>This is the 6-digit code sent to your inbox.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyAccount;
