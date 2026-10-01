"use client";

import { useState } from "react";
import { Check, Copy, Mail, Share2, X } from "lucide-react";

type ShareModalProps = {
  url: string;
  open: boolean;
  onClose: () => void;
};

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.49 0 .14 5.35.14 11.91c0 2.1.55 4.15 1.6 5.96L.03 24l6.27-1.64a11.87 11.87 0 0 0 5.75 1.47h.01c6.55 0 11.9-5.35 11.9-11.91 0-3.18-1.24-6.17-3.44-8.44ZM12.06 21.79a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.72.98.99-3.63-.23-.37a9.86 9.86 0 0 1-1.51-5.27C2.2 6.47 6.62 2.05 12.06 2.05c2.63 0 5.1 1.03 6.96 2.9a9.78 9.78 0 0 1 2.88 6.96c0 5.45-4.42 9.88-9.84 9.88Zm5.41-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.55l-5.13-6.71L5.2 22H1.94l7.61-8.7L1.5 2h6.72l4.64 6.1L18.244 2Zm-1.15 17.75h1.81L7.22 4.13H5.28L17.094 19.75Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.09 4.39 23.08 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.72 4.55-4.72 1.32 0 2.7.24 2.7.24v2.99h-1.52c-1.5 0-1.97.94-1.97 1.9v2.28h3.35l-.54 3.49h-2.81V24C19.61 23.08 24 18.09 24 12.07Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.68H9.33V8.99h3.42v1.56h.05c.48-.9 1.64-1.86 3.37-1.86 3.6 0 4.27 2.37 4.27 5.46v6.3ZM5.31 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM3.53 20.45h3.56V8.99H3.53v11.46ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z" />
    </svg>
  );
}

export default function ShareModal({ url, open, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) {
    return null;
  }

  const encodedUrl = encodeURIComponent(url);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this link",
          url,
        });
      } catch {}
    } else {
      await copyUrl();
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: <WhatsAppIcon />,
      url: `https://wa.me/?text=${encodedUrl}`,
      className: "bg-[#25D366] hover:bg-[#20bd5a]",
    },
    {
      name: "X",
      icon: <XIcon />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
      className: "bg-black hover:bg-neutral-800",
    },
    {
      name: "Facebook",
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: "bg-[#1877F2] hover:bg-[#0d6fe8]",
    },
    {
      name: "LinkedIn",
      icon: <LinkedInIcon />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      className: "bg-[#0A66C2] hover:bg-[#0959a8]",
    },
  ];

  const shareByEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      "Check out this link",
    )}&body=${encodedUrl}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Share link
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Share your shortened URL
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="min-w-0 flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
            {url}
          </div>

          <button
            type="button"
            onClick={copyUrl}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {shareLinks.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                window.open(
                  item.url,
                  "_blank",
                  "noopener,noreferrer,width=700,height=600",
                );
              }}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition ${item.className}`}
              >
                {item.icon}
              </span>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {item.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={shareByEmail}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>

          <button
            type="button"
            onClick={shareNative}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <Share2 className="h-4 w-4" />
            More
          </button>
        </div>
      </div>
    </div>
  );
}
