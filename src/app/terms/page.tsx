import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-16 sm:py-20">
            <p className="shortly-eyebrow">Legal</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Terms
            </h1>
            <p className="mt-4 max-w-2xl shortly-muted">
              Basic terms for using the current Shortly service.
            </p>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="max-w-3xl space-y-10">
              <LegalSection
                title="Using Shortly"
                text="You may use Shortly to create and manage short links for lawful purposes. You are responsible for the destinations and content associated with links you create."
              />

              <LegalSection
                title="Accounts"
                text="You are responsible for maintaining access to your account credentials and for activity performed through your account."
              />

              <LegalSection
                title="Prohibited use"
                text="Do not use Shortly for unlawful activity, malicious redirects, abuse, impersonation, fraud or distribution of harmful content."
              />

              <LegalSection
                title="Availability"
                text="Shortly is an actively developed product. Features may change, improve or be removed, and uninterrupted availability is not guaranteed."
              />

              <LegalSection
                title="Updates"
                text="These terms may be revised as the product evolves. Continued use of the service after updates means the revised terms apply."
              />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function LegalSection({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 leading-8 shortly-muted">{text}</p>
    </section>
  );
}
