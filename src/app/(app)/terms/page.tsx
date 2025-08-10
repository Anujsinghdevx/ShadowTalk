'use client';

import React from 'react';
import Link from 'next/link';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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


const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export default function TermsPage() {
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

        {/* Animated blobs */}
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

        {/* Header */}
        <section className="container mx-auto px-4 md:px-8 pt-16 pb-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }} className="max-w-3xl">
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Terms of Service
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg md:text-xl text-white/85">
              Please read these terms carefully before using ShadowTalk. By accessing our service, you agree to these terms.
            </motion.p>
          </motion.div>
        </section>

        {/* Section: Acceptance of Terms */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionReveal}
        >
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-white">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              By using ShadowTalk, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use.
            </CardContent>
          </Card>
        </motion.section>

        {/* Section: User Responsibilities */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionReveal}
        >
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-white">2. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="text-white/90 space-y-3">
              <ul className="list-disc pl-5 space-y-2">
                <li>Do not use the platform for harassment, abuse, or illegal activities.</li>
                <li>You are responsible for maintaining the confidentiality of your account.</li>
                <li>Report any abuse or policy violations immediately.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* Section: Content Policy */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionReveal}
        >
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-white">3. Content Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-white/90 space-y-3">
              <p>You retain ownership of your content but grant us a license to display it for service operation.</p>
              <p>We reserve the right to remove content that violates our policies.</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Section: Termination */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionReveal}
        >
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-white">4. Termination</CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              We may suspend or terminate your access if you violate these terms or engage in prohibited activities.
            </CardContent>
          </Card>
        </motion.section>

        {/* Section: Contact */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionReveal}
        >
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-white">5. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              If you have questions about these terms, reach out via email
            </CardContent>
          </Card>
        </motion.section>

        {/* CTA */}
        <section className="container mx-auto px-4 md:px-8 pb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Button asChild className="rounded-2xl">
              <Link href="/sign-up">Accept & Continue</Link>
            </Button>
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  );
}
