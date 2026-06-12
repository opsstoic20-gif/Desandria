import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desandria — Discord bots from plain English",
  description:
    "Describe your Discord bot in plain English. It's generated, tested, and hosted 24/7 in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
