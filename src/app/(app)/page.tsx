'use client';

import React from 'react';
import Link from 'next/link';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Share2, Shield, BarChart } from 'lucide-react';
import messages from '@/messages.json';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

// Types
interface Message {
  title: string;
  content: string;
  received: string;
}

// Easing (typed, TS-safe)
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Variants (typed)
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: EASE_OUT },
  }),
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
} as const;

const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
} as const;

const Page: React.FC = () => {
  const prefersReduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <>
        {/* HERO */}
        <main
          role="main"
          aria-label="Homepage"
          className="relative isolate flex flex-col items-center justify-start min-h-[calc(100vh-64px)]"
        >
          {/* Background image */}
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: 'url(/bg1.jpg)' }}
            aria-hidden="true"
          />
          {/* Dark gradient for contrast */}
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/60 to-black/70"
            aria-hidden="true"
          />

          {/* Subtle animated blobs */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl"
            animate={!prefersReduced ? { y: [0, 14, 0] } : {}}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-[-6rem] h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl"
            animate={!prefersReduced ? { y: [0, -12, 0] } : {}}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Content container */}
          <section className="w-full max-w-6xl px-4 md:px-8 pt-16 pb-10 text-white">
            {/* Headline + subhead + CTAs */}
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.6 }}
              variants={stagger}
            >
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight"
              >
                Get Honest Feedback—Anonymously
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={1}
                className="mt-4 text-base md:text-xl text-white/85"
              >
                Share a link. Get candid insights. Improve without the awkward.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={2}
                className="mt-8 flex items-center justify-center gap-3"
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild className="px-6 py-6 text-base md:text-lg rounded-2xl">
                    <Link href="/sign-up" aria-label="Create your anonymous inbox">
                      Create your anonymous inbox
                    </Link>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    asChild
                    variant="outline"
                    className="px-6 py-6 text-base md:text-lg rounded-2xl border-white/30 text-black hover:text-white hover:bg-white/10"
                  >
                    <a href="#how-it-works" aria-label="Learn how ShadowTalk works">
                      How it works
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Sample Messages (tamed) */}
            <motion.div
              className="mt-12 md:mt-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={sectionReveal}
            >
              <h2 className="sr-only">Sample anonymous messages</h2>
              <div className="mx-auto max-w-2xl">
                <Carousel
                  plugins={[Autoplay({ delay: 3500 })]}
                  className="w-full"
                  aria-roledescription="carousel"
                  aria-label="Sample messages carousel"
                >
                  <CarouselContent>
                    {(messages as Message[]).map((message, index) => (
                      <CarouselItem key={index} className="p-2 md:p-3">
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.05 * index, ease: EASE_OUT }}
                          whileHover={{ y: -4 }}
                        >
                          <Card className="rounded-2xl bg-white/5 text-white border border-white/10 backdrop-blur-md shadow-xl">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-white/90 text-base md:text-lg font-semibold">
                                {message.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-start gap-3 md:gap-4">
                              <Mail className="shrink-0 mt-1 text-white/70" aria-hidden="true" />
                              <div>
                                <p className="text-white/90 leading-relaxed">{message.content}</p>
                                <p className="text-xs text-white/60 mt-2">{message.received}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </motion.div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="w-full bg-black/60 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16 text-white">
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.6 }}
                variants={fadeUp}
              >
                How ShadowTalk Works
              </motion.h2>

              <motion.div
                className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={stagger}
              >
                {[
                  {
                    icon: <Share2 aria-hidden="true" />,
                    title: '1. Share your link',
                    text:
                      'Create your inbox and share the unique link anywhere—social, bio, or DMs.',
                  },
                  {
                    icon: <Shield aria-hidden="true" />,
                    title: '2. Receive anonymously',
                    text:
                      'People send messages without revealing identity. You stay in control.',
                  },
                  {
                    icon: <BarChart aria-hidden="true" />,
                    title: '3. Learn & improve',
                    text:
                      'Spot patterns, respond (optionally), and keep the best feedback.',
                  },
                ].map((item, i) => (
                  <motion.div key={item.title} variants={fadeUp} custom={i}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={!prefersReduced ? { y: [0, -2, 0] } : {}}
                          transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="p-2 rounded-lg bg-white/10"
                        >
                          {item.icon}
                        </motion.div>
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-white/80">{item.text}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 bg-black text-white/80 text-sm">
          © {new Date().getFullYear()} ShadowTalk. All rights reserved.
        </footer>
      </>
    </MotionConfig>
  );
};

export default Page;
