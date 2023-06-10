import "./globals.css";
import { Providers } from "@/store/Provider";

export const metadata = {
  title: "Google Keep",
  description: "A notes app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
