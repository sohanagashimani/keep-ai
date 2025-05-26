import "./globals.css";
import { Providers } from "@/store/Provider";
import ClientToastContainer from "@/components/ClientToastContainer";

export const metadata = {
  title: "Keep AI",
  description: "A modern, AI-powered notes app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <ClientToastContainer />
      </body>
    </html>
  );
}
