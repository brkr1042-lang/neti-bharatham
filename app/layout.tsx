import type { Metadata, Viewport } from 'next';
import {
  Playfair_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Noto_Sans_Telugu,
  Noto_Serif_Telugu,
  Noto_Sans_Devanagari
} from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-playfair'
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta'
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-telugu-sans'
});

const notoSerifTelugu = Noto_Serif_Telugu({
  subsets: ['telugu'],
  weight: ['600', '700', '800'],
  variable: '--font-telugu-serif'
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-jetbrains'
});

export const viewport: Viewport = {
  themeColor: '#991B1B',
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'నేటి భారతం (Neti Bharatam) - Multilingual Indian News Portal',
  description:
    'National, State, District & Mandal News Portal in Telugu, Hindi, and English with Reporter Dashboard, Digital Press ID, Private Ads, and YouTube Live Updates.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NetiBharatam'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    title: 'నేటి భారతం (Neti Bharatam) - Multilingual Indian News Portal',
    description:
      'National, State, District & Mandal News Portal in Telugu, Hindi, and English with Reporter Dashboard, Digital Press ID, Private Ads, and YouTube Live Updates.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'నేటి భారతం (Neti Bharatam) - Multilingual Indian News Portal',
    description:
      'National, State, District & Mandal News Portal in Telugu, Hindi, and English with Reporter Dashboard, Digital Press ID, Private Ads, and YouTube Live Updates.'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="te"
      className={`${playfair.variable} ${jakarta.variable} ${notoSansTelugu.variable} ${notoSerifTelugu.variable} ${notoDevanagari.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans antialiased bg-[#FBF9F5] text-stone-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
