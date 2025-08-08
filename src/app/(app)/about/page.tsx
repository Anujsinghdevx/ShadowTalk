// app/about/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, EyeOff, MessageSquare, Sparkles, Lock, BarChart3, Globe2 } from 'lucide-react';
import { type Variants, type Easing } from 'framer-motion';

const EASE_OUT: Easing = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: EASE_OUT },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export default function AboutPage() {
  const prefersReduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <main id="main" className="relative isolate px-5 sm:px-10 text-white overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: 'url(/bg1.jpg)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-black/80 to-black" />

        {/* Soft animated blobs */}
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

        {/* Hero */}
        <section className="container mx-auto px-4 md:px-8 pt-16 pb-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }} className="max-w-3xl">
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              About ShadowTalk
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg md:text-xl text-white/85">
              A safe, simple way to collect candid, anonymous feedback—so you can learn, improve, and build more honest
              communities.
            </motion.p>
            <motion.div variants={stagger} className="mt-8 flex gap-3">
              <motion.div variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild className="rounded-2xl">
                  <Link href="/sign-up">Create your anonymous inbox</Link>
                </Button>
              </motion.div>
              <motion.div variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild variant="outline" className="rounded-2xl border-white/30 text-black hover:text-white hover:bg-white/10">
                  <Link href="/#how-it-works">How it works</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Mission */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionReveal}
        >
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              ShadowTalk exists to lower the social cost of honesty. Feedback is vital, but asking for it can be
              awkward—and giving it can feel risky. We make anonymous, respectful feedback effortless, so creators,
              teams, and communities can grow faster with fewer blind spots.
            </CardContent>
          </Card>
        </motion.section>

        {/* Why ShadowTalk */}
        <section className="container mx-auto px-4 md:px-8 pb-4">
          <motion.h2
            className="text-2xl md:text-3xl font-bold"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp}
          >
            Why ShadowTalk
          </motion.h2>

          <motion.div
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
          >
            {[
              { icon: <MessageSquare className="text-white/70" />, title: 'Frictionless', text: 'Share a link anywhere. Anyone can send feedback—no accounts required.' },
              { icon: <Shield className="text-white/70" />, title: 'Safe by default', text: 'Content filters, rate limiting, and reporting tools reduce abuse.' },
              { icon: <EyeOff className="text-white/70" />, title: 'True anonymity', text: 'We don’t expose identity to recipients. IPs aren’t shown to users.' },
              { icon: <Lock className="text-white/70" />, title: 'Privacy-minded', text: 'Minimal data retention with clear controls to delete messages.' },
              { icon: <BarChart3 className="text-white/70" />, title: 'Actionable insights', text: 'Spot patterns over time and keep track of the feedback that matters.' },
              { icon: <Sparkles className="text-white/70" />, title: 'Polished UX', text: 'Clean, fast, mobile-first design that gets out of your way.' },
            ].map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}>
                <Card className="group rounded-2xl border-white/10 bg-white/5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
                  <CardHeader className="flex-row items-center gap-3">
                    <motion.div
                      className="p-2 rounded-lg bg-white/10"
                      animate={!prefersReduced ? { y: [0, -2, 0] } : {}}
                      transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {f.icon}
                    </motion.div>
                    <CardTitle className="text-lg text-white">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80">{f.text}</CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Trust & Safety + Privacy */}
        <motion.section
          className="container mx-auto px-4 md:px-8 py-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={stagger}>
            {[
              {
                title: 'Trust & Safety',
                items: [
                  'Profanity & abuse filtering with ongoing tuning.',
                  'Rate limiting and spam protection on message submissions.',
                  'Report + block controls for recipients.',
                  'Clear takedown paths and responsive moderation.',
                ],
              },
              {
                title: 'Privacy',
                items: [
                  'No public exposure of sender identity to recipients.',
                  'Configurable data retention and easy deletion tools.',
                  'Transport security and secure storage for user accounts.',
                  'Transparent policies you can actually read.',
                ],
              },
            ].map((block, i) => (
              <motion.div key={block.title} variants={fadeUp} custom={i}>
                <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{block.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/85 space-y-3">
                    <p>We take this seriously and bake it into the product:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      {block.items.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Stats */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionReveal}
        >
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
            <CardContent className="py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { label: 'Messages sent', value: '100K+' },
                  { label: 'Active inboxes', value: '5K+' },
                  { label: 'Avg. response time', value: '< 1s' },
                  { label: 'Countries', value: <span className="inline-flex items-center gap-1"><Globe2 className="h-4 w-4" /> 50+</span> },
                ].map((s, i) => (
                  <motion.div key={String(s.label)} className="will-change-transform" variants={fadeUp} custom={i}>
                    <div className="text-3xl text-white font-extrabold">{s.value}</div>
                    <div className="mt-1 text-sm text-white/70">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* FAQ */}
        <section className="container mx-auto px-4 md:px-8 pb-16">
          <motion.h2
            className="text-2xl md:text-3xl font-bold"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp}
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.div className="mt-6 space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={stagger}>
            {[
              { q: 'Is feedback really anonymous?', a: 'Yes. Senders are not shown to recipients. We may process technical metadata for abuse prevention, but we do not expose identity to users.' },
              { q: 'Can I reply to messages?', a: 'You can optionally respond if you enable replies for your inbox. Replies preserve sender anonymity.' },
              { q: 'How do you handle abuse?', a: 'Messages pass through filters and rate limits. Users can report or block; we review and may remove content or restrict accounts.' },
              { q: 'Is ShadowTalk free?', a: 'There is a generous free tier. Advanced features are available on paid plans (see Pricing).' },
            ].map((item, i) => (
              <motion.details key={item.q} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4" variants={fadeUp} custom={i}>
                <summary className="cursor-pointer list-none font-semibold">{item.q}</summary>
                <p className="mt-2 text-white/85">{item.a}</p>
              </motion.details>
            ))}
          </motion.div>

          <motion.div className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Button asChild className="rounded-2xl">
              <Link href="/sign-up">Get started — it’s free</Link>
            </Button>
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  );
}
