import type { AppProps } from "next/app";
import "../styles/globals.css";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="container flex items-center justify-between py-3">
          <Link href="/" className="text-xl font-semibold">Prospecting Command Center</Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm">Search</Link>
            <Link href="/signals" className="text-sm">Signals</Link>
            <Link href="/agent" className="text-sm">Agent Portal</Link>
            <Link href="/upload" className="text-sm">Upload Wizard</Link>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        <Component {...pageProps} />
      </main>
      <footer className="border-t">
        <div className="container py-4 text-sm text-gray-500">© Prototype – for demo purposes</div>
      </footer>
    </div>
  );
}
