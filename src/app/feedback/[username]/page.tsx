'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Sparkles, Send, Bot, Shield } from 'lucide-react';
import { MotionConfig, motion } from 'framer-motion';
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

type FormValues = z.infer<typeof messageSchema>;

// If your schema has a max length, set the same number here to keep UX in sync.
const MAX_CHARS = 500;

const EASE = [0.22, 1, 0.36, 1] as const;

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params?.username || 'guest';
  const { toast } = UseToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  const content = form.watch('content');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const handleMessageClick = (message: string) => {
    form.setValue('content', message, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', { ...data, username });
      toast({ title: 'Sent', description: response.data.message });
      form.reset({ content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
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
      const parsed = raw
        .split('||')
        .map((q: string) => q.trim())
        .filter(Boolean);
      setSuggestedMessages(parsed);
    } catch (error) {
      setSuggestError('Failed to fetch suggested messages.');
      console.error(error);
    } finally {
      setIsSuggestLoading(false);
    }
  };

  const chars = content?.length ?? 0;
  const remaining = Math.max(0, MAX_CHARS - chars);
  const tooLong = chars > MAX_CHARS;

  return (
    <MotionConfig reducedMotion="user">
      <main
        className="relative min-h-dvh overflow-x-clip text-white"
        aria-label={`Public board of @${username}`}
      >
        {/* Background to match theme */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#312e81_0%,#0b1021_45%,#000_100%)]"
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[-4rem] h-96 w-96 rounded-full bg-violet-400/20 blur-3xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="text-indigo-300 h-6 w-6" />
                Public Board of @{username}
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/80">
              Send an anonymous note. Keep it kind and constructive.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <Shield className="h-4 w-4" />
              Protected by filters & rate limiting
            </div>
          </motion.header>

          {/* Composer */}
          <section className="mt-8">
            <Card className="rounded-2xl border-white/10 bg-white/10 backdrop-blur-md">
              <CardHeader className="pb-2">
                <h2 className="text-lg text-white font-semibold">Message @{username}</h2>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Your message</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea
                                {...field}
                                placeholder="Type something kind, funny, or insightful…"
                                className="resize-none bg-white text-gray-900 placeholder:text-gray-500 min-h-[140px]"
                                maxLength={MAX_CHARS}
                              />
                              <div className="pointer-events-none absolute right-2 bottom-2 text-[11px] sm:text-xs text-gray-600">
                                {remaining} / {MAX_CHARS}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-center">
                      <Button
                        type="submit"
                        disabled={!content || isLoading || tooLong}
                        className="flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin w-4 h-4" /> Sending…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Send it
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </section>

          {/* Suggestions */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            className="space-y-4 my-10 "
          >
            <div className="flex items-center gap-2">
              <Button onClick={fetchSuggestedMessages} disabled={isSuggestLoading} className="flex gap-2">
                {isSuggestLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Generating…
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" /> Generate with AI
                  </>
                )}
              </Button>
            </div>

            <Card className="rounded-2xl border-white/10 bg-white/10 backdrop-blur-md">
              <CardHeader className="pb-2">
                <h3 className="text-base text-white sm:text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-4  h-4 text-indigo-300" />
                  Smart suggestions
                </h3>
                <p className="text-xs sm:text-sm text-white/70">
                  Click a prompt to use it as your message. Edit before sending if you want.
                </p>
              </CardHeader>
              <CardContent>
                {suggestError ? (
                  <p className="text-red-300">{suggestError}</p>
                ) : suggestedMessages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestedMessages.map((msg, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleMessageClick(msg)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-left text-xs sm:text-sm text-white hover:bg-white/15 transition"
                        title="Use this suggestion"
                      >
                        {msg}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/70">No suggestions yet.</p>
                )}
              </CardContent>
            </Card>
          </motion.section>

          <Separator className="my-8 bg-white/10" />

          {/* CTA */}
          <footer className="text-center">
            <p className="mb-4 text-white/80 text-sm sm:text-base">
              Want your own anonymous board?
            </p>
            <Link href="/sign-up">
              <Button className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">
                Create your account
              </Button>
            </Link>
          </footer>
        </div>
      </main>
    </MotionConfig>
  );
}
