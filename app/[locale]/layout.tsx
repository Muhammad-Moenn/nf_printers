import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";



import { Poppins } from "next/font/google"
import {
  ClerkProvider
} from '@clerk/nextjs'
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ToastContainer } from 'react-toastify';
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})


export const metadata: Metadata = {
  title: "NF Printers - Professional Printing Services",
  description: "Professional printing services for business cards, flyers, brochures, and more. Order online and track your printing projects.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
export default async function RootLayout({
  children,
  params, 
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  ;
  return (
    <html lang={locale}  suppressHydrationWarning={true} >
      <NextIntlClientProvider >
     <ClerkProvider>
      <body
     
       className={poppins.variable}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      </body>
      </ClerkProvider>
      </NextIntlClientProvider>
    </html>
  );
}
