import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-20 sm:py-24 lg:py-28">
            <p className="shortly-eyebrow">About Shortly</p>

            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">
              A focused tool for making links easier to use.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 shortly-muted">
              Shortly is a link management product built to make creating,
              sharing and understanding short URLs feel simple and intentional.
            </p>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <p className="shortly-eyebrow">Why it exists</p>

                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em]">
                  Short links should be useful after you create them.
                </h2>
              </div>

              <div className="space-y-5 text-base leading-8 shortly-muted">
                <p>
                  Many URL shorteners stop at creating a smaller address.
                  Shortly is being built around the full lifecycle of a shared
                  link: creation, management, sharing and performance insight.
                </p>

                <p>
                  The product is intentionally focused. The goal is not to bury
                  simple workflows under layers of configuration, but to give
                  people the controls they actually need in a clear interface.
                </p>

                <p>
                  Shortly is a Nexvius Labs product and is actively evolving as
                  new capabilities are added.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
