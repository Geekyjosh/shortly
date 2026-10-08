"use client";

import { Download, Share, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;

  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const DISMISS_KEY = "shortly-install-dismissed";

const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

function recentlyDismissed() {
  if (typeof window === "undefined") {
    return true;
  }

  const dismissedAt = localStorage.getItem(DISMISS_KEY);

  if (!dismissedAt) {
    return false;
  }

  const timestamp = Number(dismissedAt);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp < DISMISS_DURATION;
}

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean(
        (
          navigator as Navigator & {
            standalone?: boolean;
          }
        ).standalone,
      ))
  );
}

function isIOSDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [showIOSHelp, setShowIOSHelp] = useState(false);

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function handleInstallPrompt(event: Event) {
      event.preventDefault();

      if (isStandalone() || recentlyDismissed()) {
        return;
      }

      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstallEvent(null);
      setShowIOSHelp(false);
      setHidden(true);

      localStorage.removeItem(DISMISS_KEY);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    window.addEventListener("appinstalled", handleInstalled);

    /*
     * iOS does not expose beforeinstallprompt.
     * We show our own guidance instead.
     */
    if (isIOSDevice() && !isStandalone() && !recentlyDismissed()) {
      const timer = window.setTimeout(() => {
        setShowIOSHelp(true);
      }, 2500);

      return () => {
        window.clearTimeout(timer);

        window.removeEventListener("beforeinstallprompt", handleInstallPrompt);

        window.removeEventListener("appinstalled", handleInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);

      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();

    const choice = await installEvent.userChoice;

    setInstallEvent(null);

    if (choice.outcome === "accepted") {
      setHidden(true);
    } else {
      dismissPrompt();
    }
  }

  function dismissPrompt() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());

    setInstallEvent(null);
    setShowIOSHelp(false);
    setHidden(true);
  }

  if (hidden || (!installEvent && !showIOSHelp)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[120] mx-auto max-w-lg shortly-rise sm:left-auto sm:right-5 sm:w-[430px]">
      <div
        className="rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:p-5"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "var(--brand-soft)",
              color: "var(--brand)",
            }}
          >
            <Smartphone className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Install Shortly</h2>

                <p className="mt-1 text-sm leading-6 shortly-muted">
                  Add Shortly to your device for faster access to your links and
                  analytics.
                </p>
              </div>

              <button
                type="button"
                onClick={dismissPrompt}
                aria-label="Dismiss install prompt"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shortly-subtle transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {installEvent && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleInstall}
                  className="shortly-button-primary flex-1"
                >
                  <Download className="h-4 w-4" />
                  Install Shortly
                </button>

                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="shortly-button-secondary"
                >
                  Not now
                </button>
              </div>
            )}

            {showIOSHelp && (
              <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-sm shortly-muted">
                  To install Shortly on your iPhone or iPad:
                </p>

                <div className="mt-3 flex items-start gap-2 text-sm">
                  <Share className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                  <p>
                    Tap the <strong>Share</strong> button in Safari, then choose{" "}
                    <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="shortly-button-secondary mt-4 w-full"
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
