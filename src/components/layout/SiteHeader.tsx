"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  Layers3,
  Link2,
  LogIn,
  Menu,
  Moon,
  Plus,
  QrCode,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const productLinks = [
  {
    href: "/features",
    label: "URL Shortener",
    description: "Create clean, memorable short links.",
    icon: Link2,
  },
  {
    href: "/link-management",
    label: "Link Management",
    description: "Organize and control every link.",
    icon: LayoutDashboard,
  },
  {
    href: "/link-analytics",
    label: "Analytics",
    description: "Understand what happens after the click.",
    icon: BarChart3,
  },
  {
    href: "/qr-code-generator",
    label: "QR Codes",
    description: "Take your links beyond the screen.",
    icon: QrCode,
  },
  {
    href: "/dashboard/bulk",
    label: "Bulk Shortener",
    description: "Shorten multiple URLs in one batch.",
    icon: Layers3,
  },
  {
    href: "/dashboard/utm",
    label: "UTM Builder",
    description: "Build campaign tracking links and shorten them.",
    icon: Sparkles,
  },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode, toggleTheme } = useTheme();

  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const productRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!cancelled) {
          setAuthenticated(Boolean(data.authenticated));
          setAuthChecked(true);
        }
      } catch {
        if (!cancelled) {
          setAuthenticated(false);
          setAuthChecked(true);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProductOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        productRef.current &&
        !productRef.current.contains(event.target as Node)
      ) {
        setProductOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function closeMenus() {
    setMobileOpen(false);
    setProductOpen(false);
  }

  async function handleLogout() {
    closeMenus();

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setAuthenticated(false);
      router.push("/");
      router.refresh();
    }
  }

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  const productActive = productLinks.some((item) => isActive(item.href));

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:var(--background)]/90 backdrop-blur-xl">
      <div className="shortly-container">
        <div className="flex h-[72px] items-center justify-between gap-6">
          <Link
            href="/"
            onClick={closeMenus}
            className="flex shrink-0 items-center"
            aria-label="Shortly home"
          >
            <Image
              src="/logo.svg"
              alt="Shortly"
              width={116}
              height={38}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            <div ref={productRef} className="relative">
              <button
                type="button"
                onClick={() => setProductOpen((current) => !current)}
                aria-expanded={productOpen}
                aria-haspopup="menu"
                className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition ${
                  productActive
                    ? "text-[var(--foreground)]"
                    : "shortly-muted hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Product
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    productOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {productOpen && (
                <div
                  role="menu"
                  className="shortly-rise absolute left-0 top-[calc(100%+10px)] w-[420px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl"
                >
                  <div className="grid gap-1">
                    {productLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          onClick={closeMenus}
                          className="group flex gap-3 rounded-xl p-3 transition hover:bg-[var(--surface-muted)]"
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{
                              background: "var(--brand-soft)",
                              color: "var(--brand)",
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <span>
                            <span className="block text-sm font-semibold">
                              {item.label}
                            </span>

                            <span className="mt-1 block text-xs leading-5 shortly-subtle">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/solutions" active={isActive("/solutions")}>
              Solutions
            </NavLink>

            <NavLink href="/help" active={isActive("/help")}>
              Help
            </NavLink>

            <NavLink href="/pricing" active={isActive("/pricing")}>
              Pricing
            </NavLink>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {authChecked && authenticated && (
              <>
                <Link href="/dashboard" className="shortly-button-secondary">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/create"
                  className="shortly-button-primary"
                >
                  <Plus className="h-4 w-4" />
                  Create link
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-10 rounded-lg px-3 text-sm font-medium shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                >
                  Sign out
                </button>
              </>
            )}

            {authChecked && !authenticated && (
              <>
                <Link
                  href="/login"
                  className="min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                >
                  Log in
                </Link>

                <Link href="/register" className="shortly-button-primary">
                  Get started
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] shortly-muted"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[var(--border)] bg-[var(--background)] lg:hidden"
        >
          <div className="shortly-container max-h-[calc(100vh-73px)] overflow-y-auto py-5">
            <nav aria-label="Mobile navigation" className="space-y-6">
              <div>
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.12em] shortly-subtle">
                  Product
                </p>

                <div className="mt-2 grid gap-1">
                  {productLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-[var(--surface-muted)]"
                      >
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{
                            background: "var(--brand-soft)",
                            color: "var(--brand)",
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <div className="grid gap-1">
                  <MobileLink href="/solutions" onClick={closeMenus}>
                    Solutions
                  </MobileLink>

                  <MobileLink href="/help" onClick={closeMenus}>
                    Help
                  </MobileLink>

                  <MobileLink href="/pricing" onClick={closeMenus}>
                    Pricing
                  </MobileLink>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-5">
                {authChecked && authenticated ? (
                  <div className="grid gap-2">
                    <Link
                      href="/dashboard"
                      onClick={closeMenus}
                      className="shortly-button-secondary w-full"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/create"
                      onClick={closeMenus}
                      className="shortly-button-primary w-full"
                    >
                      <Plus className="h-4 w-4" />
                      Create link
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="shortly-button-secondary w-full"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href="/login"
                      onClick={closeMenus}
                      className="shortly-button-secondary w-full"
                    >
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Link>

                    <Link
                      href="/register"
                      onClick={closeMenus}
                      className="shortly-button-primary w-full"
                    >
                      Get started
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition ${
        active
          ? "text-[var(--foreground)]"
          : "shortly-muted hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}

      {active && (
        <span className="absolute inset-x-3 -bottom-[17px] h-0.5 bg-blue-500" />
      )}
    </Link>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-3 py-3 text-sm font-medium shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
    >
      {children}
    </Link>
  );
}
