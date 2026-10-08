import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-16 sm:py-20">
            <p className="shortly-eyebrow">Legal</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Privacy
            </h1>
            <p className="mt-4 max-w-2xl shortly-muted">
              A plain-language overview of the information Shortly currently
              handles.
            </p>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="max-w-3xl space-y-10">
              <LegalSection
                title="Account information"
                text="When you create an account, Shortly stores the information needed to provide authentication and account functionality, including your email address and password hash."
              />

              <LegalSection
                title="Link information"
                text="Shortly stores URLs you create, their short codes, status, creation time, expiration settings and ownership information where applicable."
              />

              <LegalSection
                title="Analytics information"
                text="When a Shortly link is opened, the service may store click-related information such as the time of the click, referrer, user agent and country information made available by the hosting environment."
              />

              <LegalSection
                title="Sessions"
                text="Shortly uses session cookies to keep signed-in users authenticated and may use a guest identifier cookie to manage limited guest link creation."
              />

              <LegalSection
                title="Changes"
                text="This page reflects the current product at a high level and may be updated as Shortly adds new features, integrations or data practices."
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
