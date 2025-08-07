'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Sparkles, Send, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params?.username || 'guest';
  const { toast } = UseToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  const messageContent = form.watch('content');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });
      toast({
        title: '✅ Success',
        description: response.data.message,
      });
      form.reset({ content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: '❌ Error',
        description: axiosError.response?.data?.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setSuggestError(null);
    try {
      const res = await axios.post('/api/suggest-messages');
      const raw = res.data.questions || '';
      const parsed = raw.split('||').map((q: string) => q.trim());
      setSuggestedMessages(parsed);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestError('Failed to fetch suggested messages.');
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <main className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl shadow">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-blue-600" /> Public Board of @{username}
        </h1>
        <p className="text-gray-600 text-sm">Send your anonymous message now.</p>
      </motion.header>

      <section className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to @{username}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type something kind, funny, or interesting..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={!messageContent || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 " /> Send It
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 my-10"
      >
        <div className="flex items-center gap-2">
          <Button onClick={fetchSuggestedMessages} disabled={isSuggestLoading} className="flex gap-2">
            {isSuggestLoading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" /> Fetching...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" /> Generate with AI
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Smart Suggestions from AI
            </h3>
            <p className="text-sm text-gray-500">
              These are AI-generated prompts to inspire your message. Click to use.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {suggestError ? (
              <p className="text-red-500">{suggestError}</p>
            ) : suggestedMessages.length > 0 ? (
              suggestedMessages.map((msg, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleMessageClick(msg)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left border px-4 py-2 rounded-md hover:bg-gray-50 transition"
                >
                  {msg}
                </motion.button>
              ))
            ) : (
              <p className="text-gray-500">No suggestions yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <Separator className="my-6" />

      <footer className="text-center">
        <p className="mb-4">Want your own anonymous board?</p>
        <Link href="/sign-up">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Your Account</Button>
        </Link>
      </footer>
    </main>
  );
}
