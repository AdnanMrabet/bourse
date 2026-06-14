import type { Metadata } from 'next';
import { Orbitron, Chakra_Petch, Share_Tech_Mono } from 'next/font/google';
import './globals.css';

const display = Orbitron({
  weight: ['500', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bourse - the market that trades on argument, not capital',
  description:
    'Bourse is an on-chain idea market on GenLayer. List an idea as a tradable asset, then move its price with a bull or bear thesis. An AI Analyst rules the call under validator consensus and the price settles on chain.',
  openGraph: {
    title: 'Bourse',
    description:
      'List an idea, pitch a thesis, and let an on-chain AI Analyst re-price it under validator consensus. The market moves on argument, not capital.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bourse',
    description:
      'An on-chain idea market where prices move on argument, not capital, settled by AI consensus on GenLayer.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
