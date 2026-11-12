"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Globe2,
  Layers3,
  Link2,
  MousePointerClick,
  QrCode,
  ShieldCheck,
  Sparkles,
  Tags,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export type MarketingIcon =
  | "link" | "analytics" | "qr" | "shield" | "globe"
  | "click" | "layers" | "tags" | "timer" | "sparkles";

export type MarketingFeature = {
  icon: MarketingIcon;
  title: string;
  description: string;
};

export type MarketingStat = { value: string; label: string };
export type MarketingFaq = { question: string; answer: string };

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  stats?: MarketingStat[];
  features: MarketingFeature[];
  faqs?: MarketingFaq[];
  sectionEyebrow?: string;
  sectionTitle: string;
  sectionDescription: string;
  closingTitle: string;
  closingDescription: string;
};

const iconMap: Record<MarketingIcon, LucideIcon> = {
  link: Link2,
  analytics: BarChart3,
  qr: QrCode,
  shield: ShieldCheck,
  globe: Globe2,
  click: MousePointerClick,
  layers: Layers3,
  tags: Tags,
  timer: TimerReset,
  sparkles: Sparkles,
};

const workflow = [
  { label: "Create", title: "A cleaner link, ready to share.", value: "shortly.nexviuslabs.com/launch", detail: "Turn a long destination into a short, memorable URL." },
  { label: "Manage", title: "Keep control after publishing.", value: "Destination · Status · Expiry", detail: "Update destinations, pause links and set an expiry when needed." },
  { label: "Measure", title: "See what happens after the click.", value: "Clicks · Sources · Devices", detail: "Review link activity and understand where visits come from." },
];

export default function MarketingPage({
  eyebrow,
  title,
  description,
  primaryCta = { label: "Create a short link", href: "/#shorten" },
  secondaryCta = { label: "Create account", href: "/register" },
  stats = [],
  features,
  faqs = [],
  sectionEyebrow = "Product capabilities",
  sectionTitle,
  sectionDescription,
  closingTitle,
  closingDescription,
}: MarketingPageProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const activeWorkflow = workflow[activeStep];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)] bg-[#0b1730] text-white">
          <div className="shortly-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14 lg:py-[4.5rem]">
            <div className="shortly-rise">
              <div className="inline-flex items-center gap-2 rounded-md border border-blue-300/25 bg-blue-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {eyebrow}
              </div>
              <h1 className="mt-6 max-w-3xl text-[2.65rem] font-semibold leading-[1.04] tracking-[-0.05em] sm:text-5xl lg:text-[3.65rem]">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                {description}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={primaryCta.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500">
                  {primaryCta.label}<ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={secondaryCta.href} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                  {secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="shortly-rise rounded-xl border border-white/15 bg-[#111f3b] p-4 shadow-2xl sm:p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold text-white">The link workflow</p>
                  <p className="mt-1 text-[11px] text-slate-400">One place. Three useful steps.</p>
                </div>
                <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">WORKSPACE</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2" role="tablist" aria-label="Link workflow">
                {workflow.map((step, index) => (
                  <button key={step.label} type="button" role="tab" aria-selected={activeStep === index} onClick={() => setActiveStep(index)} className={`rounded-md px-2 py-3 text-left text-xs font-semibold transition ${activeStep === index ? "bg-blue-600 text-white" : "bg-white/[0.05] text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                    <span className="mb-1 block text-[10px] font-medium opacity-70">0{index + 1}</span>{step.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-white/10 bg-[#0b1730] p-4 sm:p-5" role="tabpanel">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-300">
                  {activeStep === 0 ? <Link2 className="h-4 w-4" /> : activeStep === 1 ? <Layers3 className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                  {activeWorkflow.label}
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">{activeWorkflow.title}</h2>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 py-3">
                  <span className="min-w-0 truncate font-mono text-xs text-slate-200">{activeWorkflow.value}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-blue-300" />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">{activeWorkflow.detail}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                <span>SHORTLY / PRODUCT</span><span>0{activeStep + 1} — 03</span>
              </div>
            </div>
          </div>
          {stats.length > 0 && (
            <div className="border-t border-white/10">
              <div className="shortly-container grid grid-cols-3 divide-x divide-white/10">
                {stats.map((stat) => (
                  <div key={stat.label} className="py-5 pr-3 sm:py-6 sm:pr-6">
                    <p className="text-xl font-semibold tracking-tight sm:text-2xl">{stat.value}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="py-14 sm:py-16 lg:py-[4.5rem]">
          <div className="shortly-container">
            <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-7 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="shortly-eyebrow">{sectionEyebrow}</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">{sectionTitle}</h2>
              </div>
              <p className="max-w-md text-sm leading-6 shortly-muted">{sectionDescription}</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = iconMap[feature.icon];
                return (
                  <article key={feature.title} className="group relative min-h-[190px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_12px_30px_rgba(15,23,42,.08)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand)]"><Icon className="h-5 w-5" /></span>
                      <span className="font-mono text-xs shortly-subtle">0{index + 1}</span>
                    </div>
                    <h3 className="mt-7 text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 shortly-muted">{feature.description}</p>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-blue-600 transition-transform duration-300 group-hover:scale-x-100" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border)]" style={{ background: "var(--surface-muted)" }}>
          <div className="shortly-container grid gap-8 py-12 sm:py-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-16">
            <div>
              <p className="shortly-eyebrow">Built around the work</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">Less hunting through menus. More control over every link.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 shortly-muted">Shortly keeps the everyday link actions close together, so you can move from creating a URL to managing and measuring it without switching tools.</p>
              <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:gap-3">Explore your workspace <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              {[
                { n: "01", title: "Create and customize", text: "Use a generated short code or choose an alias that means something." },
                { n: "02", title: "Manage with confidence", text: "Edit the destination, control link status and set an expiry date." },
                { n: "03", title: "Review link activity", text: "Track clicks and inspect the sources, devices and browsers behind them." },
              ].map((item, index) => (
                <div key={item.n} className={`flex gap-4 p-5 sm:p-6 ${index ? "border-t border-[var(--border)]" : ""}`}>
                  <span className="font-mono text-xs font-semibold text-blue-600">{item.n}</span>
                  <div><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-6 shortly-muted">{item.text}</p></div>
                  <Check className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="py-14 sm:py-16">
            <div className="shortly-container grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
              <div>
                <p className="shortly-eyebrow">Support</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Questions, answered.</h2>
                <p className="mt-3 text-sm leading-6 shortly-muted">A few details to help you get more out of Shortly.</p>
                <Link href="/help" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:gap-3">Visit help centre <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="border-t border-[var(--border)]">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <article key={faq.question} className="border-b border-[var(--border)]">
                      <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left">
                        <span className="text-sm font-semibold sm:text-base">{faq.question}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-blue-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 shortly-muted">{faq.answer}</p>}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="pb-14 sm:pb-16">
          <div className="shortly-container">
            <div className="grid gap-6 rounded-xl bg-[#0b1730] p-6 text-white sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-11">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-300">Get started with Shortly</p>
                <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">{closingTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{closingDescription}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Link href="/#shorten" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500">Create a short link <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10">Create account</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
