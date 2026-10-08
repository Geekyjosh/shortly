import Link from "next/link";
import { ArrowLeft, Home, Link2 } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main className="shortly-container flex min-h-[68vh] items-center py-16 sm:py-20">
        <div className="mx-auto w-full max-w-2xl text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: "var(--brand-soft)",
              color: "var(--brand)",
            }}
          >
            <Link2 className="h-6 w-6" />
          </div>

          <p className="mt-7 shortly-eyebrow">404 — Page not found</p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            This link doesn&apos;t lead anywhere.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 shortly-muted">
            The page may have moved, the URL may be incorrect, or the
            destination may no longer exist.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="shortly-button-primary">
              <Home className="h-4 w-4" />
              Go home
            </Link>

            <Link href="/dashboard" className="shortly-button-secondary">
              <ArrowLeft className="h-4 w-4" />
              Open dashboard
            </Link>
          </div>

          <div className="mt-12 border-t border-[var(--border)] pt-7">
            <p className="text-sm shortly-subtle">
              Looking for something else?
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
              <Link
                href="/features"
                className="shortly-muted transition hover:text-blue-500"
              >
                Features
              </Link>

              <Link
                href="/pricing"
                className="shortly-muted transition hover:text-blue-500"
              >
                Pricing
              </Link>

              <Link
                href="/help"
                className="shortly-muted transition hover:text-blue-500"
              >
                Help
              </Link>

              <Link
                href="/login"
                className="shortly-muted transition hover:text-blue-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
