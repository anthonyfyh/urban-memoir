import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Urban Memoir",
  description: "Stories from the streets, parks, and hearts of Vancouver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quicksand.className} antialiased flex flex-col min-h-screen`}>
        <div className="flex-1">{children}</div>
        <footer className="bg-amber-50 px-6 py-8 border-t border-stone-200">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href="https://www.instagram.com/theurban_memoir?igsh=dmIycHB6cDhnamEy&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-stone-600 hover:text-stone-900 transition group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              <span className="text-sm">Follow us to see featured stories & what's to come!</span>
            </a>
            <a
              href="https://forms.gle/gTV9qCCGeaquACu37"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-stone-600 hover:text-stone-900 transition font-medium underline underline-offset-2"
            >
              Got feedback?
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
