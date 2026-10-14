import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk, Syne } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jbmono",
});

export const metadata: Metadata = {
  title:
    "Students.DB — CRUD Application by Mohammad Ramish Ansari · EWB Internship",
  description:
    "Full Create / Read / Update / Delete students API built with FastAPI and SQLite by Mohammad Ramish Ansari (B.Tech CSE, University of Lucknow). Includes an optional Ollama AI assistant and a live interactive console.",
  authors: [{ name: "Mohammad Ramish Ansari", url: "https://www.linkedin.com/in/ramish-ansari/" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${space.variable} ${mono.variable}`}
    >
      <body className="bg-[#060609] font-[family-name:var(--font-space)] text-[#f4f4f6] antialiased">
        <div className="noise" aria-hidden="true" />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          closeButton
          toastOptions={{
            style: {
              background: "#10101a",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#f4f4f6",
            },
          }}
        />
      </body>
    </html>
  );
}
