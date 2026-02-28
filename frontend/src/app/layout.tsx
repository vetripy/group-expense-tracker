import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Group Expense Tracker",
  description: "Track shared expenses with groups",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: "12px" },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
