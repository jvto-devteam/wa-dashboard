import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { AuthProvider } from "@/components/providers";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WA Dashboard",
  description: "WhatsApp Multi-User Dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-invoke-path") ?? h.get("x-pathname") ?? "";
  const isAuthPage = pathname === "/login" || pathname.startsWith("/login");

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {isAuthPage ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            {children}
          </div>
        ) : (
          <AuthProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 ml-64 overflow-y-auto">
                <div className="min-h-screen p-8">{children}</div>
              </main>
            </div>
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
