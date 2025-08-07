'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useDebounceCallback } from 'usehooks-ts';
import { motion } from 'framer-motion';
import { Loader2, UserPlus, AtSign, Mail, Lock } from 'lucide-react';
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

const Page: React.FC = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 500);
  const { toast } = UseToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (!username) return;
      setIsCheckingUsername(true);
      setUsernameMessage('');

      try {
        const res = await axios.get(`/api/check-username-unique?username=${username}`);
        setUsernameMessage(res.data.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(axiosError.response?.data.message || 'Something went wrong');
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const emailRes = await axios.post('/api/send-verification', {
        email: data.email,
        username: data.username,
        otp: generatedOtp,
      });

      toast({
        title: '📩 Verification email sent',
        description: emailRes.data.message,
      });

      const res = await axios.post('/api/sign-up', data);
      toast({
        title: '✅ Account created',
        description: res.data.message,
      });

      router.replace(`/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: '⚠️ Error',
        description: axiosError.response?.data.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 flex items-center justify-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" /> Join Shadow Talk
          </h1>
          <p className="text-gray-700 text-sm md:text-base">Create an account to continue</p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <AtSign className="w-4 h-4" /> Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  )}
                  {usernameMessage && (
                    <p
                      className={`text-sm ${usernameMessage.toLowerCase().includes('available')
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> Email
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
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
                    <Input type="password" placeholder="Create a password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Sign Up
                </>
              )}
            </Button>
          </form>
        </Form>

        <footer className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-600 hover:underline font-medium">
            Sign in here
          </Link>
        </footer>
      </motion.section>
    </main>
  );
};

export default Page;