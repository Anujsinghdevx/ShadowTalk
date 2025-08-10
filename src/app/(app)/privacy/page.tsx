'use client';

import React from 'react';
import Link from 'next/link';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Cookie, Database, Globe2, Mail, Clock3, UserCheck } from 'lucide-react';
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

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export default function PrivacyPage() {
  const prefersReduced = useReducedMotion();

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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

        {/* Soft animated blobs (subtle) */}
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
        <section className="container mx-auto px-4 md:px-8 pt-16 pb-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            className="max-w-3xl"
          >
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight"
            >
              Privacy Policy
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-4 text-lg md:text-xl text-white/85"
            >
              Your privacy matters. This page explains what we collect, why we collect it,
              and how you stay in control when using ShadowTalk.
            </motion.p>
            <motion.p variants={fadeUp} custom={2} className="mt-2 text-white/70">
              Last updated: {lastUpdated}
            </motion.p>
          </motion.div>
        </section>

        {/* Core sections */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={stagger}>
            {/* What we collect */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Database className="text-white/70" />
                  </div>
                  <CardTitle className="text-xl text-white">Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="text-white/85 space-y-2">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Account data:</span> email, username, and a hashed password.
                    </li>
                    <li>
                      <span className="font-medium">Messages:</span> content you submit or receive via your inbox.
                    </li>
                    <li>
                      <span className="font-medium">Usage & device:</span> IP address, browser/device, logs for security.
                    </li>
                    <li>
                      <span className="font-medium">Cookies:</span> session cookies for authentication and preferences.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* How we use */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Shield className="text-white/70" />
                  </div>
                  <CardTitle className="text-xl text-white">How We Use Information</CardTitle>
                </CardHeader>
                <CardContent className="text-white/85 space-y-2">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Operate, maintain, and improve ShadowTalk.</li>
                    <li>Keep accounts secure and prevent abuse/spam.</li>
                    <li>Provide support and essential service communications.</li>
                    <li>Analyze usage (aggregated/limited) to improve features.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cookies */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Cookie className="text-white/70" />
                  </div>
                  <CardTitle className="text-xl text-white">Cookies</CardTitle>
                </CardHeader>
                <CardContent className="text-white/85 space-y-2">
                  <p>
                    We use cookies for secure sign-in, session persistence, and preferences.
                    You can control cookies in your browser, but disabling them may break core functionality
                    (like staying logged in).
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sharing */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <UserCheck className="text-white/70" />
                  </div>
                  <CardTitle className="text-xl text-white">Sharing & Disclosure</CardTitle>
                </CardHeader>
                <CardContent className="text-white/85 space-y-2">
                  <p className="mb-2">
                    We don’t sell your personal data. We may share limited information with:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Trusted processors (hosting, analytics, email) under strict agreements.</li>
                    <li>Authorities if required by law or to protect safety and rights.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Retention */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Clock3 className="text-white/70" />
                  </div>
                  <CardTitle className="text-xl text-white">Data Retention</CardTitle>
                </CardHeader>
                <CardContent className="text-white/85 space-y-2">
                  <p>
                    We keep data only as long as needed to provide the Service or comply with law.
                    You can delete messages or your account; residual backups may persist briefly for safety and recovery.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Lock className="text-white/70" />
                  </div>
                  <CardTitle className="text-xl text-white">Security</CardTitle>
                </CardHeader>
                <CardContent className="text-white/85 space-y-2">
                  <p>
                    We use encryption in transit, hardened infrastructure, access controls, and monitoring.
                    No method is perfectly secure; please use a strong password and keep it private.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* International */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Globe2 className="text-white/70" />
                  </div>
                  <CardTitle className="text-xl text-white">International Transfers</CardTitle>
                </CardHeader>
                <CardContent className="text-white/85 space-y-2">
                  <p>
                    If you access ShadowTalk from outside our hosting region, your data may be processed there.
                    We apply safeguards and standard contractual measures where applicable.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Rights */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Shield className="text-white/70" />
                  </div>
                  <CardTitle className="text-xl text-white">Your Rights & Choices</CardTitle>
                </CardHeader>
                <CardContent className="text-white/85 space-y-2">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Access, update, or delete your account and messages.</li>
                    <li>Export your data upon request.</li>
                    <li>Opt out of non-essential communications.</li>
                    <li>Disable cookies in your browser (may impact login/session).</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Changes + Contact */}
        <motion.section
          className="container mx-auto px-4 md:px-8 pb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionReveal}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl text-white">Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-white/85 space-y-2">
                <p>
                  We may update this page to reflect changes in our practices or legal requirements.
                  We’ll revise the “Last updated” date above and, where appropriate, notify you.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader className="flex-row items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Mail className="text-white/70" />
                </div>
                <CardTitle className="text-xl text-white">Contact</CardTitle>
              </CardHeader>
              <CardContent className="text-white/85 space-y-2">
                <p>
                  Questions or requests? Email us at{' '}
                  <a className="underline decoration-white/40 underline-offset-4 hover:decoration-white" href="mailto:privacy@shadowtalk.com">
                    privacy@shadowtalk.com
                  </a>.
                </p>
              </CardContent>
            </Card>
          </div>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button asChild className="rounded-2xl">
              <Link href="/sign-up">Create your anonymous inbox</Link>
            </Button>
          </motion.div>
        </motion.section>
      </main>
    </MotionConfig>
  );
}
