'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import messages from '@/messages.json';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

// Define the shape of a message to make TypeScript happy
interface Message {
  title: string;
  content: string;
  received: string;
}

const Page: React.FC = () => {
  return (
    <>
      <main
        className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-indigo-900 text-white"
        style={{
          backgroundImage: 'url(/bg1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Hero Section */}
        <section className="text-center mb-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-100">
            ShadowTalk – Hidden yet powerful messages
          </p>
        </section>

        {/* Carousel Section */}
        <Carousel
          plugins={[Autoplay({ delay: 3000 })]}
          className="w-full max-w-lg md:max-w-2xl"
        >
          <CarouselContent>
            {(messages as Message[]).map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card className="bg-white text-black shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-600 text-lg font-semibold">
                      {message.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start gap-3">
                    <Mail className="text-gray-600" />
                    <div>
                      <p>{message.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 md:p-6 bg-black text-white text-sm md:text-base">
        © {new Date().getFullYear()} ShadowTalk. All rights reserved.
      </footer>
    </>
  );
};

export default Page;
