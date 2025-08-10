// components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-black backdrop-blur-md text-white">
      <div className="container mx-auto px-6 md:px-10 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: brand + short line */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="ShadowTalk"
                width={28}
                height={28}
                className="rounded"
                priority={false}
              />
              <span className="text-sm md:text-base font-semibold tracking-tight">
                ShadowTalk
              </span>
            </Link>
            <span className="hidden md:inline text-white/40">•</span>
            <p className="text-xs md:text-sm text-white/60">
              Candid, anonymous feedback—done right.
            </p>
          </div>

          {/* Right: nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-4 text-sm">
              <li>
                <Link href="/#how-it-works" className="text-white/80 hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/80 hover:text-white">
                  Terms
                </Link>
              </li>
              <li className="hidden md:block text-white/30">|</li>
              <li>
                <Link href="/sign-up" className="text-white/80 hover:text-white">
                  Get started
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom line */}
        <div className="mt-4 text-xs text-white/60">
          © {year} ShadowTalk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
