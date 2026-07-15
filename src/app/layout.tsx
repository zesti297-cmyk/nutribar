import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { LocaleHtmlSync } from "../components/locale-html-sync";
import { I18nProvider } from "../lib/i18n";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nutribar: Acompanhamento nutricional pós-cirúrgico",
  description:
    "Acompanhamento nutricional por 1 ano após cirurgia internacional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider>
          <LocaleHtmlSync />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
