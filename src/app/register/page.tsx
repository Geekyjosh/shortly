"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  Link2,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useState } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to create your account.",
        );
        return;
      }

      router.push("/login");
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        <div className="shortly-container py-10 sm:py-14 lg:py-20">
          <div className="grid min-h-[720px] overflow-hidden rounded-[28px] border border-[var(--border)] lg:grid-cols-[1fr_.9fr]">
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
                  Create your workspace
                </p>

                <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white">
                  Give your links a better home.
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
                  Create an account to keep your short links organized,
                  editable and measurable as your library grows.
                </p>
              </div>

              <div className="relative grid gap-3">
                <Feature
                  icon={Link2}
                  title="Save every link"
                  text="Keep your shortened URLs attached to your account."
                />

                <Feature
                  icon={BarChart3}
                  title="Track performance"
                  text="See click activity and link-level analytics."
                />

                <Feature
                  icon={QrCode}
                  title="Share more ways"
                  text="Use cleaner URLs and QR-ready link workflows."
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
                      Get started
                    </p>
                  </div>

                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                    Create your account
                  </h2>

                  <p className="mt-3 text-sm leading-6 shortly-muted">
                    Start managing your shortened links from one
                    workspace.
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
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium"
                        >
                          Name
                        </label>

                        <span className="text-xs shortly-subtle">
                          Optional
                        </span>
                      </div>

                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Your name"
                        autoComplete="name"
                        className="shortly-input"
                      />
                    </div>

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
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium"
                      >
                        Password
                      </label>

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
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                          minLength={8}
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

                      <div className="mt-3">
                        {passwordChecks.map(
                          (check) => (
                            <div
                              key={check.label}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                  check.valid
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-[var(--surface-muted)] shortly-subtle"
                                }`}
                              >
                                <Check className="h-2.5 w-2.5" />
                              </span>

                              <span
                                className={
                                  check.valid
                                    ? "text-emerald-500"
                                    : "shortly-subtle"
                                }
                              >
                                {check.label}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="shortly-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "Creating account..."
                        : "Create account"}

                      {!loading && (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-xs leading-5 shortly-subtle">
                    By creating an account, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="underline underline-offset-2 hover:text-[var(--foreground)]"
                    >
                      Terms
                    </Link>{" "}
                    and acknowledge our{" "}
                    <Link
                      href="/privacy"
                      className="underline underline-offset-2 hover:text-[var(--foreground)]"
                    >
                      Privacy
                    </Link>{" "}
                    page.
                  </p>

                  <div className="mt-7 border-t border-[var(--border)] pt-6">
                    <p className="text-center text-sm shortly-muted">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-semibold text-blue-500 hover:text-blue-400"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs shortly-subtle">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Your password is stored as a secure hash
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
