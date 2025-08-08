'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { MessageSquare, Trash2, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UseToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';

type Message = {
  _id: string;
  title?: string;
  content: string;
  createdAt?: string | Date;
};

export function MessageCardGlass({
  message,
  onDelete,
}: {
  message: Message;
  onDelete?: (id: string) => void;
}) {
  const created = message.createdAt ? new Date(message.createdAt).toLocaleString() : '';
  const { toast } = UseToast();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      const res = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`);
      toast({ title: res.data.message });
      onDelete?.(message._id);
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message ?? 'Failed to delete message',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/10 to-transparent"
    >
      <div className="rounded-2xl h-full w-full bg-white/10 backdrop-blur-md border border-white/10">
        {/* subtle top accent */}
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-indigo-400/60 via-violet-400/60 to-fuchsia-400/60" />

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-white/90">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-white/10">
                <MessageSquare className="h-4 w-4 text-white/80" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold leading-tight">
                  {message.title || 'New message'}
                </h3>
                {created && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] sm:text-xs text-white/60">
                    <Clock className="h-3.5 w-3.5" />
                    {created}
                  </p>
                )}
              </div>
            </div>

            {/* Delete with confirm dialog */}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    aria-label="Delete message"
                    disabled={deleting}
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The message will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting}>
                      {deleting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting…
                        </span>
                      ) : (
                        'Delete'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/85 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
