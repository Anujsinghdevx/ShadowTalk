'use client';

import React, { useCallback, useEffect, useMemo, useState, JSX } from 'react';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { UseToast } from '@/hooks/use-toast';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from 'react-share';

import { Loader2, RefreshCcw, CopyCheck, Link as LinkIcon, Inbox } from 'lucide-react';
import { MotionConfig, motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCardGlass } from '@/components/MessageCardGlass';

/* -------------------- Types -------------------- */
type Sentiment = {
  tag: 'POSITIVE' | 'NEGATIVE' | 'UNCERTAIN';
  confidence?: number;
  positive_score?: number;
  negative_score?: number;
};

type MessageWithSentiment = Message & { sentiment?: Sentiment; _id: string };

type FilterKey = 'all' | 'positive' | 'negative' | 'neutral';

type Buckets = {
  positive: MessageWithSentiment[];
  negative: MessageWithSentiment[];
  neutral: MessageWithSentiment[];
};

type Counts = {
  positive: number;
  negative: number;
  neutral: number;
};

type AcceptMessageForm = z.infer<typeof AcceptMessageSchema>;

interface ApiMessagesResponse {
  messages: MessageWithSentiment[];
  buckets: Buckets;
  counts: Counts;
}

interface SessionUser {
  username?: string;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.06 * i, ease: EASE_OUT },
  }),
} as const;

const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
} as const;

/* -------------------- Component -------------------- */
function UserDashboard(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [, setMounted] = useState(false);
  const { toast } = UseToast();
  const { data: session } = useSession();
  const prefersReduced = useReducedMotion();

  const form = useForm<AcceptMessageForm>({
    resolver: zodResolver(AcceptMessageSchema),
    defaultValues: { acceptMessages: false },
  });
  const { watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  useEffect(() => setMounted(true), []);

  const profileUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const username = (session?.user as SessionUser | undefined)?.username;
    return username ? `${base}/feedback/${username}` : '';
  }, [session?.user]);

  const [messages, setMessages] = useState<MessageWithSentiment[]>([]);
  const [buckets, setBuckets] = useState<Buckets>({ positive: [], negative: [], neutral: [] });
  const [counts, setCounts] = useState<Counts>({ positive: 0, negative: 0, neutral: 0 });

  const [filter, setFilter] = useState<FilterKey>('all');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<{ isAcceptingMessages: boolean }>('/api/accept-messages');
      setValue('acceptMessages', Boolean(response.data.isAcceptingMessages), { shouldDirty: false });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiMessagesResponse>('/api/get-messages');
        setMessages(response.data.messages);
        setBuckets(response.data.buckets);
        setCounts(response.data.counts);
        if (refresh) toast({ title: 'Refreshed', description: 'Latest messages loaded.' });
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description: axiosError.response?.data?.message ?? 'Failed to fetch messages',
          variant: 'default',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session?.user, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async (next: boolean) => {
    setValue('acceptMessages', next, { shouldDirty: true });
    setIsSwitchLoading(true);
    try {
      const response = await axios.post<{ message: string }>('/api/accept-messages', {
        acceptMessages: next,
      });
      toast({ title: response.data.message ?? 'Updated' });
    } catch (error) {
      setValue('acceptMessages', !next, { shouldDirty: false });
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message ?? 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    setBuckets((prev) => ({
      positive: prev.positive.filter((m) => m._id !== messageId),
      negative: prev.negative.filter((m) => m._id !== messageId),
      neutral: prev.neutral.filter((m) => m._id !== messageId),
    }));
    setCounts((prev) => ({
      positive: Math.max(0, prev.positive - 1),
      negative: Math.max(0, prev.negative - 1),
      neutral: Math.max(0, prev.neutral - 1),
    }));
  };

  const copyToClipboard = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const el = document.createElement('textarea');
        el.value = profileUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      toast({ title: 'Copied!', description: 'Link copied to clipboard.' });
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy the link manually.', variant: 'destructive' });
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return messages;
    if (filter === 'positive') return buckets.positive;
    if (filter === 'negative') return buckets.negative;
    return buckets.neutral;
  }, [filter, messages, buckets]);

  const pageSize = 20;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageSlice = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  return (
    <MotionConfig>
      <main
        className="relative min-h-dvh pt-10 overflow-x-clip text-white"
        aria-label="Dashboard"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#312e81_0%,#0b1021_45%,#000_100%)]"
        />
        {!prefersReduced && (
          <>
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
          </>
        )}

        <div className="mx-auto w-full max-w-6xl px-4 md:px-8 py-10">
          {/* Header */}
          <motion.header
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your ShadowTalk
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/80">
              Share your link, manage messages, and keep the feedback flowing.
            </p>
          </motion.header>

          {/* Shareable Link (glass card) */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={sectionReveal}
            className="mb-8"
            aria-labelledby="share-link"
          >
            <Card className="rounded-2xl border-white/10 bg-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle
                  id="share-link"
                  className="text-center text-lg flex items-center justify-center gap-2 text-white"
                >
                  <LinkIcon className="h-5 w-5 text-indigo-200" />
                  Your shareable link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
                  <input
                    type="text"
                    value={profileUrl}
                    readOnly
                    aria-label="Shareable Profile Link"
                    className="w-full lg:w-3/5 px-4 py-2 rounded-md bg-white text-gray-900 shadow-inner text-sm focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={copyToClipboard} size="sm" variant="default" className="relative">
                            <CopyCheck className="h-4 w-4 mr-1" />
                            {copied ? 'Copied' : 'Copy'}
                            <AnimatePresence>
                              {copied && (
                                <motion.span
                                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-emerald-300"
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }}
                                  transition={{ duration: 0.25 }}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy to clipboard</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <WhatsappShareButton url={profileUrl}>
                            <WhatsappIcon size={32} round />
                          </WhatsappShareButton>
                        </TooltipTrigger>
                        <TooltipContent>Share on WhatsApp</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TelegramShareButton url={profileUrl}>
                            <TelegramIcon size={32} round />
                          </TelegramShareButton>
                        </TooltipTrigger>
                        <TooltipContent>Share on Telegram</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <LinkedinShareButton url={profileUrl}>
                            <LinkedinIcon size={32} round />
                          </LinkedinShareButton>
                        </TooltipTrigger>
                        <TooltipContent>Share on LinkedIn</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Accept Messages toggle */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={sectionReveal}
            className="mb-6"
            aria-live="polite"
          >
            <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md px-4 py-3">
              <Switch
                checked={acceptMessages}
                onCheckedChange={(checked) => handleSwitchChange(Boolean(checked))}
                disabled={isSwitchLoading}
              />
              <span className="ml-3 text-sm font-medium text-white/90">
                Accept messages: {isSwitchLoading ? 'Updating…' : acceptMessages ? 'On' : 'Off'}
              </span>
            </div>
          </motion.section>

          <Separator className="my-6 bg-white/10" />

          {/* Sentiment Filter */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="inline-flex gap-2">
              {([
                { key: 'all', label: 'All', count: messages.length },
                { key: 'positive', label: 'Positive', count: counts.positive },
                { key: 'negative', label: 'Negative', count: counts.negative },
                { key: 'neutral', label: 'Neutral', count: counts.neutral },
              ] as Array<{ key: FilterKey; label: string; count: number }>).map(({ key, label, count }) => {
                const active = filter === key;
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={active ? 'default' : 'outline'}
                    onClick={() => setFilter(key)}
                    className={active ? '' : 'border-white/30 text-black hover:text-white hover:bg-white/10'}
                    aria-pressed={active}
                  >
                    {label}
                    <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">{count}</span>
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() => fetchMessages(true)}
              variant="outline"
              className="border-white/30 text-black hover:text-white hover:bg-white/10"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              <span className="ml-2">{isLoading ? 'Refreshing…' : 'Refresh'}</span>
            </Button>
          </motion.section>

          {/* Messages */}
          <section aria-label="Messages" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              {isLoading && messages.length === 0 ? (
                [...Array(6)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                    className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md h-40 animate-pulse"
                  />
                ))
              ) : messages.length > 0 ? (
                pageSlice.map((message, index) => {
                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      whileHover={{ scale: 1.02, boxShadow: '0px 8px 16px rgba(0,0,0,0.25)' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.28, delay: index * 0.03, ease: EASE_OUT }}
                    >
                      <MessageCardGlass
                        message={message}
                        onDelete={handleDeleteMessage}
                      />
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  key="empty"
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="col-span-full"
                >
                  <Card className="rounded-2xl border-dashed border-white/20 bg-white/5 backdrop-blur-md">
                    <CardContent className="py-10 text-center text-white/85">
                      <div className="mx-auto mb-3 grid place-items-center h-12 w-12 rounded-full bg-white/10">
                        <Inbox className="h-6 w-6 text-white/70" />
                      </div>
                      <p className="font-medium">No messages yet</p>
                      <p className="text-sm text-white/70 mt-1">
                        Share your link to start receiving anonymous feedback.
                      </p>
                      <div className="mt-4">
                        <Button asChild>
                          <Link href="#share-link">Copy your link</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Pagination */}
          {messages.length > pageSize && (
            <motion.section
              className="flex justify-center mt-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <nav className="flex gap-2" aria-label="Pagination">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const active = currentPage === page;
                  return (
                    <Button
                      key={page}
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      aria-current={active ? 'page' : undefined}
                      className={active ? '' : 'border-white/30 text-white hover:bg-white/10'}
                    >
                      {page}
                    </Button>
                  );
                })}
              </nav>
            </motion.section>
          )}
        </div>
      </main>
    </MotionConfig>
  );
}

export default UserDashboard;
