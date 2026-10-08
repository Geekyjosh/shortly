"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Link2,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useState } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        <div className="shortly-container py-10 sm:py-14 lg:py-20">
          <div className="grid min-h-[680px] overflow-hidden rounded-[28px] border border-[var(--border)] lg:grid-cols-[1fr_.9fr]">
            <section
              className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between xl:p-14"
              style={{
                background:
                  "linear-gradient(145deg, #0f172a 0%, #0b1736 52%, #102554 100%)",
              }}
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/15 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[110px]" />

              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                  Welcome back
                </p>

                <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white">
                  Your links are waiting.
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
                  Sign in to manage links, review performance, update
                  destinations and keep everything organized from one place.
                </p>
              </div>

              <div className="relative grid gap-3">
                <Feature
                  icon={Link2}
                  title="Manage every link"
                  text="Edit, disable and organize your shortened URLs."
                />

                <Feature
                  icon={BarChart3}
                  title="Understand performance"
                  text="See which links are getting attention."
                />

                <Feature
                  icon={QrCode}
                  title="Share anywhere"
                  text="Copy, share and generate QR-ready links."
                />
              </div>
            </section>

            <section
              className="flex items-center"
              style={{
                background: "var(--surface)",
              }}
            >
              <div className="w-full px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
                <div className="mx-auto max-w-md">
                  <div className="lg:hidden">
                    <p className="shortly-eyebrow">
                      Welcome back
                    </p>
                  </div>

                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                    Sign in to Shortly
                  </h2>

                  <p className="mt-3 text-sm leading-6 shortly-muted">
                    Access your dashboard, analytics and saved links.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                  >
                    {error && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500"
                      >
                        {error}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium"
                      >
                        Email address
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="shortly-input"
                        required
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          Password
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          id="password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={password}
                          onChange={(event) =>
                            setPassword(
                              event.target.value,
                            )
                          }
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="shortly-input pr-12"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (current) =>
                                !current,
                            )
                          }
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg shortly-subtle transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="shortly-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "Signing in..."
                        : "Sign in"}

                      {!loading && (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </button>
                  </form>

                  <div className="mt-7 border-t border-[var(--border)] pt-6">
                    <p className="text-center text-sm shortly-muted">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/register"
                        className="font-semibold text-blue-500 hover:text-blue-400"
                      >
                        Create one
                      </Link>
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs shortly-subtle">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure session-based authentication
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Link2;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}
