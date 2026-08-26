import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Secure File Storage",
  description: "Upload, manage, and share your files securely.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <main className="flex min-h-screen">
        {/* You can add your Sidebar and Top Navbar here later */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </AuthGuard>
  );
}
