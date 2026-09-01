import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dino Explorer — SEO Intelligence",
  description: "Dino Explorer — fast, cinematic SEO intelligence and site auditing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <div className="jurassic-scene" aria-hidden="true">
          <div className="jurassic-ambient jurassic-ambient--rex" />
          <div className="jurassic-ambient jurassic-ambient--raptor" />
          <div className="jurassic-ambient jurassic-ambient--fossil" />
          <div className="jurassic-fossil-overlay" />
        </div>
        <div className="grain" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
