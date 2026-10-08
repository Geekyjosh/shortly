import SiteHeader from "@/components/layout/SiteHeader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main className="shortly-container py-10 sm:py-12">
        <div className="animate-pulse">
          <div className="h-3 w-24 rounded bg-[var(--surface-subtle)]" />

          <div className="mt-5 h-10 max-w-md rounded-lg bg-[var(--surface-subtle)] sm:h-12" />

          <div className="mt-4 h-4 max-w-xl rounded bg-[var(--surface-subtle)]" />

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div key={index} className="bg-[var(--surface)] p-6">
                <div className="h-3 w-24 rounded bg-[var(--surface-subtle)]" />

                <div className="mt-5 h-8 w-20 rounded bg-[var(--surface-subtle)]" />

                <div className="mt-3 h-3 w-32 rounded bg-[var(--surface-subtle)]" />
              </div>
            ))}
          </div>

          <div
            className="mt-8 rounded-2xl border p-6"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="h-5 w-40 rounded bg-[var(--surface-subtle)]" />

            <div className="mt-3 h-3 w-64 max-w-full rounded bg-[var(--surface-subtle)]" />

            <div className="mt-8 space-y-4">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 rounded-xl bg-[var(--surface-muted)]"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
