'use client';
import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { UseToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
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
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw, CopyCheck, Link } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { motion, AnimatePresence } from 'framer-motion';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = UseToast();
  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({ title: 'Refreshed', description: 'Latest messages loaded.' });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description: axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'default',
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({ title: response.data.message });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Update failed',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message._id !== messageId));
  };

  if (!session?.user) return null;

  const { username } = session.user as User;
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/feedback/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({ title: 'Copied!', description: 'Link copied to clipboard.' });
  };

  return (
    <main className="w-full px-4 md:px-8 py-10 bg-white max-w-6xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900">User Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage public link and messages</p>
      </motion.header>

      {/* Shareable Link Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card className="shadow-sm border bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <CardHeader>
            <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
              <Link className="h-5 w-5 text-indigo-600" />
              Your Shareable Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
              <input
                type="text"
                value={profileUrl}
                readOnly
                aria-label="Shareable Profile Link"
                className="w-full lg:w-3/5 px-4 py-2 border rounded-md bg-white shadow-inner text-sm focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={copyToClipboard} size="sm" variant="default">
                        <CopyCheck className="h-4 w-4 mr-1" /> Copy
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

      {/* Accept Messages Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <div className="flex items-center">
          <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <label className="ml-3 text-sm font-medium text-gray-700">
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </label>
        </div>
      </motion.section>

      <Separator className="my-6" />

      {/* Refresh Button Section */}
      <section className="mb-6 flex justify-end">
        <Button onClick={() => fetchMessages(true)} variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </section>

      {/* Messages Section */}
      <section aria-label="Messages" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          <AnimatePresence>
            {messages
              .slice((currentPage - 1) * 20, currentPage * 20)
              .map((message, index) => (
                <motion.div
                  key={message._id as React.Key}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  whileHover={{ scale: 1.02, boxShadow: '0px 8px 16px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MessageCard
                    message={message}
                    onMessageDelete={handleDeleteMessage}
                  />
                </motion.div>
              ))}
          </AnimatePresence>
        ) : (
          <p className="text-gray-500 text-center col-span-full">No messages to display.</p>
        )}
      </section>

      {/* Pagination Controls */}
      {messages.length > 20 && (
        <section className="flex justify-center mt-6">
          <div className="flex gap-2">
            {[...Array(Math.ceil(messages.length / 20))].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default UserDashboard;