import type { Metadata } from "next";
import "./globals.css";

// ✅ Import Fonts
import { Inter, Manrope } from "next/font/google";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "Task Manager | Intelligic Solutions",
    template: "%s | Task Manager",
  },
  description:
    "Manage tasks, employees and projects efficiently with Task Manager SaaS by Intelligic Solutions.",
  keywords: [
    "task manager",
    "project management",
    "employee dashboard",
    "task tracking",
    "intelligic solutions",
  ],
  authors: [{ name: "Intelligic Solutions" }],
  creator: "Intelligic Solutions",

  icons: {
    icon: "/Icon.png",
    shortcut: "/Icon.png",
    apple: "/Icon.png",
  },

  openGraph: {
    title: "Task Manager SaaS",
    description:
      "Powerful task and employee management system for modern teams.",
    url: "https://yourdomain.com",
    siteName: "Task Manager",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Task Manager",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Task Manager SaaS",
    description:
      "Manage tasks, employees and projects efficiently.",
    images: ["/logo.png"],
  },

  metadataBase: new URL("https://yourdomain.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
