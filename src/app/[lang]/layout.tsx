import type { Metadata } from 'next';
import '../globals.css';
import { getDictionary } from '../../get-dictionary';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'IB Heros - Premium Tutoring',
  description: 'Achieve your academic goals with Australia\'s best tutors.',
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'zh' }];
}

import { Providers } from '@/components/Providers';
import Script from 'next/script';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const validLang = (lang === 'en' || lang === 'zh') ? lang : 'en';
  const dict = await getDictionary(validLang);

  return (
    <html lang={validLang}>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-Y0J270BX4Z"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Y0J270BX4Z');
          `}
        </Script>
      </head>
      <body>
        <Providers>
          <Header dict={dict} lang={validLang} />
          {children}
          <Footer dict={dict} lang={validLang} />
        </Providers>
      </body>
    </html>
  );
}
