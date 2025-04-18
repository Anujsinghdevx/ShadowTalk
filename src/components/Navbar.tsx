'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import type { User as NextAuthUser } from 'next-auth';

// Optional: Extend the User type if your user object includes extra fields like 'username'
interface ExtendedUser extends NextAuthUser {
  username?: string;
}

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const user = session?.user as ExtendedUser | undefined;

  return (
    <header className="bg-black text-white shadow-md" aria-label="Main navigation">
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:flex-nowrap md:px-6 md:py-6">
        {/* Logo & Brand */}
        <Link
          href="/"
          className="flex items-center gap-2"
          title="Go to homepage"
          aria-label="Homepage"
        >
          <Image
            src="/logo.png"
            alt="Site logo"
            width={40}
            height={40}
            className="rounded"
            priority
          />
          <span className="text-lg md:text-xl font-semibold tracking-tight">ShadowTalk</span>
        </Link>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4 text-sm md:text-base">
          {status === 'loading' ? (
            <span className="text-gray-300 italic">Loading...</span>
          ) : session ? (
            <>
              <span
                className="truncate max-w-[140px] md:max-w-[200px]"
                title={user?.username || user?.email || ''}
              >
                Welcome, {user?.username || user?.email}
              </span>
              <Button
                onClick={() => signOut()}
                className="bg-white text-black hover:bg-gray-200 transition"
                variant="outline"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button
                className="bg-white text-black hover:bg-gray-200 transition"
                variant="outline"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
