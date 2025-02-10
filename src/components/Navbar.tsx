'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import Image from 'next/image';

function Navbar() {
  const { data: session } = useSession();
  const user : User = session?.user;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-black text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="" className="text-xl font-bold mb-4 md:mb-0">
          <Image src="/logo.png" alt="Logo" width={100} height={150} />
        </a>
        {session ? (
          <>
            <span className="mr-4 text-4xl">
              Welcome, {user.username || user.email}
            </span>
            <Link href="/">
            <Button onClick={() => signOut()} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
              Logout
            </Button>
            </Link>
          </>
        ) : (
          <Link href="/sign-in">
            <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;