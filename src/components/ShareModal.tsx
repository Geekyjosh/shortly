"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

type ShareModalProps = {
  url: string;
  open: boolean;
  onClose: () => void;
};

export default function ShareModal({ url, open, onClose }: ShareModalProps) {
  const { darkMode } = useTheme();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open || !url) return null;

  const encodedUrl = encodeURIComponent(url);
  const shareText = encodeURIComponent("Check out this link from Shortly");

  function openShare(target: string) {
    window.open(target, "_blank", "noopener,noreferrer,width=700,height=600");
    onClose();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Shortly link", url });
      onClose();
    } catch {
      /* user cancelled */
    }
  }

  const options = [
    {
      label: "WhatsApp",
      color: "bg-green-500 hover:bg-green-600",
      href: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
      icon: (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.004 2a9.95 9.95 0 0 0-8.47 15.1L2 22l4.9-1.526A10 10 0 1 0 12.004 2m0 18.3a8.3 8.3 0 0 1-4.23-1.157l-.303-.18-2.91.906.922-2.834-.198-.308A8.3 8.3 0 1 1 12.004 20.3" />
      ),
    },
    {
      label: "X",
      color: "bg-black hover:bg-slate-800",
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
      icon: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      ),
    },
    {
      label: "Facebook",
      color: "bg-blue-600 hover:bg-blue-500",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H7.7v3H10v8h3.5Z" />
      ),
    },
    {
      label: "LinkedIn",
      color: "bg-[#0A66C2] hover:bg-blue-500",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <path d="M6.5 8.2A2 2 0 1 0 6.5 4.2a2 2 0 0 0 0 4ZM4.7 9.8h3.6V20H4.7V9.8Zm5.8 0h3.4v1.4h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5V20h-3.6v-4.5c0-1.1 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5V20h-3.6V9.8Z" />
      ),
    },
  ];

  const rowButton = darkMode
    ? "border-slate-700 text-slate-300 hover:border-blue-500 hover:bg-slate-800 hover:text-white"
    : "border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-slate-50 hover:text-slate-950";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
          darkMode
            ? "border-slate-700 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-950"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="share-title" className="text-lg font-semibold">
              Share link
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose where to share your short link
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xl transition ${
              darkMode
                ? "text-slate-500 hover:bg-slate-800 hover:text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            ×
          </button>
        </div>

        <div
          className={`mt-5 truncate rounded-xl border px-4 py-3 text-sm text-blue-500 ${
            darkMode
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          {url}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => openShare(option.href)}
              className="group flex flex-col items-center gap-2"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition group-hover:-translate-y-0.5 ${option.color}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  {option.icon}
                </svg>
              </span>

              <span className="text-xs text-slate-500 transition group-hover:text-blue-500">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={copyLink}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${rowButton}`}
          >
            <span className="text-base">{copied ? "✓" : "⧉"}</span>
            {copied ? "Copied" : "Copy link"}
          </button>

          <button
            type="button"
            onClick={() => {
              const subject = encodeURIComponent("Check out this link");
              const body = encodeURIComponent(
                `I wanted to share this link with you:\n\n${url}`,
              );

              window.location.href = `mailto:?subject=${subject}&body=${body}`;
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${rowButton}`}
          >
            <span className="text-base">✉</span>
            Share via email
          </button>

          {canNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${rowButton}`}
            >
              <span className="text-base">↗</span>
              More sharing options
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
