'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const baseLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as { email?: string; username?: string } | undefined;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const authedLinks = [{ href: '/dashboard', label: 'Dashboard' }];
  const links = session ? [...authedLinks, ...baseLinks] : baseLinks;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggle = () => setOpen((s) => !s);
  const close = () => setOpen(false);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-black focus:text-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <header
        className={`fixed top-0 left-0 w-full z-[60] transition-colors duration-300 ${scrolled ? 'bg-black/50 backdrop-blur-md border-b border-white/10' : 'bg-black'
          }`}
      >
        <nav
          className="container mx-auto flex items-center justify-between gap-4 px-6 py-3 md:px-10 md:py-4"
          aria-label="Main navigation"
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2" aria-label="Homepage" onClick={close}>
            <Image
              src="/logo.png"
              alt="ShadowTalk logo"
              width={40}
              height={40}
              className="rounded"
              priority
            />
            <span className="text-lg text-white md:text-xl font-semibold tracking-tight">ShadowTalk</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="flex items-center gap-4 text-sm md:text-base">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {status === 'loading' ? (
              <div className="h-9 w-40 rounded bg-white/10 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <span
                  className="truncate max-w-[180px] text-sm text-white/90"
                  title={user?.username || user?.email || ''}
                >
                  Welcome, {user?.username || user?.email}
                </span>
                <Button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-200 rounded-xl"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl"
                >
                  <Link href="/sign-in">Login</Link>
                </Button>
                <Button asChild className="rounded-xl">
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10"
            onClick={toggle}
          >
            {open ? <X className='text-white' /> : <Menu className='text-white' />}
          </button>
        </nav>

        {/* Mobile side drawer */}
        <AnimatePresence>
          {open && (
            <>
              {/* Overlay ABOVE header */}
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[80] bg-black backdrop-blur-sm"
                onClick={close}
              />

              {/* Drawer panel */}
              <motion.aside
                key="drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.28 }}
                className="fixed right-0 top-0 z-[90] h-svh w-[84vw] max-w-xs bg-black/90 backdrop-blur-md border-l border-white/10 pt-16 flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile menu"
              >
                {/* Close button (over the drawer) */}
                <button
                  type="button"
                  className="absolute right-3 top-3 inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10 text-white"
                  onClick={close}
                  aria-label="Close menu"
                >
                  <X />
                </button>

                {/* Scrollable content */}
                <div className="px-4 pb-4 flex-1 overflow-y-auto">
                  <div className="mb-4 text-white/90 text-lg font-semibold">Menu</div>
                  <ul className="flex flex-col gap-2">
                    {links.map((l, i) => (
                      <motion.li
                        key={l.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.22 }}
                      >
                        <Link
                          href={l.href}
                          className="block rounded-lg px-3 py-2 text-white/90 hover:bg-white/10"
                          onClick={close}
                        >
                          {l.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Sticky footer (always at bottom) */}
                <div className="px-4 pb-6 pt-4 border-t border-white/10 shrink-0 bg-black/90">
                  {status === 'loading' ? (
                    <div className="h-9 w-full rounded bg-white/10 animate-pulse" />
                  ) : session ? (
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="truncate text-white text-sm text-white/90"
                        title={user?.username || user?.email || ''}
                      >
                        {user?.username || user?.email}
                      </span>
                      <Button
                        onClick={() => {
                          close();
                          signOut({ callbackUrl: '/' });
                        }}
                        variant="outline"
                        className="bg-white text-black hover:bg-gray-200 rounded-xl"
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl"
                        onClick={close}
                      >
                        <Link href="/sign-in">Login</Link>
                      </Button>
                      <Button asChild className="flex-1 rounded-xl" onClick={close}>
                        <Link href="/sign-up">Sign up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
