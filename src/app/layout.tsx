import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zue ATS — AI Resume Screening",
  description:
    "High-end AI-powered Applicant Tracking System by Zue Group of Companies. Upload resumes, match against job descriptions, and rank candidates with precision.",
  keywords: [
    "ATS",
    "AI Resume",
    "Recruitment",
    "Candidate Screening",
    "Match Score",
    "Zue Group",
  ],
  authors: [{ name: "Zue Group of Companies" }],
  icons: {
    icon: "/zue-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
