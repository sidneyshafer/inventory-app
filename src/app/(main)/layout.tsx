import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "@/components/ui/navigation";
import { mainNavItems, systemNavItems } from "@/lib/links";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inventory Management App (IMA)",
  description: "Modern inventory management application",
  icons: [{ rel: "icon", url: "./favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${GeistSans.className} antialiased h-screen flex flex-col m-0 p-0`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-right" />
            <Navigation 
              mainNavItems={mainNavItems} 
              systemNavItems={systemNavItems}
            >
              {children}
            </Navigation>
          </ThemeProvider>
      </body>
    </html>
  );
}