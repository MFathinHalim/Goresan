import "./globals.css";

import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import {UserProvider} from "@/context/userContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Goresan - Tempat berbagi karya dan inspirasi",
  description:
    "Goresan adalah platform untuk berbagi karya seni, tulisan, dan inspirasi.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <link rel="icon" type="image/x-icon" href="/icon.png" />
      <body className="bg-white dark:bg-zinc-900 dark:text-zinc-100">
        <UserProvider>
          <Navbar />
          {children}
        </UserProvider>
        </body>
    </html>
  );
}
