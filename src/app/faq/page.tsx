import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chess Tournament FAQ",
  description:
    "Answers to common questions about Swiss chess tournaments, time controls, payouts, and fair play on The King Side.",
  keywords: [
    "chess tournament faq",
    "Swiss system chess",
    "online chess tournaments",
    "chess time control",
    "chess prize pool",
    "verified payouts",
  ],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Chess Tournament FAQ",
    description:
      "Answers to common questions about Swiss chess tournaments, time controls, payouts, and fair play on The King Side.",
    url: "https://thekingside.com/faq",
    siteName: "The King Side",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chess Tournament FAQ",
    description:
      "Answers to common questions about Swiss chess tournaments, time controls, payouts, and fair play on The King Side.",
  },
};

const faqs = [
  {
    question: "What is The King Side?",
    answer:
      "The King Side is a competitive chess tournament league with scheduled events, Swiss pairings, and verified rewards.",
  },
  {
    question: "How do tournaments work?",
    answer:
      "Tournaments open for registration until the lock time, then rounds are generated automatically. Swiss pairings are used with standings updated after each round.",
  },
  {
    question: "What is the lock time?",
    answer:
      "Lock time is 2 minutes before the tournament start. After lock, new entries are blocked and the bracket is finalized.",
  },
  {
    question: "How are prize pools funded?",
    answer:
      "Entry fees are split 75% to prize pool and 25% to platform share. During free seasons, prize pools are seeded by the platform.",
  },
  {
    question: "When are payouts sent?",
    answer:
      "Payouts are queued after completion, then released once KYC verification and anti-cheat checks are cleared.",
  },
  {
    question: "What happens if there is a draw?",
    answer:
      "Draws are recorded and count as half points in Swiss standings. Tie-breaks use Buchholz and Sonneborn-Berger.",
  },
  {
    question: "What time controls are used?",
    answer:
      "Time controls are announced per tournament. Common formats include 3+2, 5+5, and 10+0.",
  },
  {
    question: "Can I report suspicious play?",
    answer:
      "Yes. Every tournament page includes an anti-cheat report form. Reported cases are reviewed by admins and logged.",
  },
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto w-full max-w-4xl space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Support
          </p>
          <h1 className="text-3xl font-semibold">Frequently asked questions</h1>
          <p className="text-white/60">
            Answers about online chess tournaments, Swiss pairings, time
            controls, and verified payouts.
          </p>
        </header>

        <section className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-white/10 bg-[rgba(26,32,44,0.7)] p-5"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-cyan-100">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm text-white/70">{faq.answer}</p>
            </details>
          ))}
        </section>

        <div className="rounded-2xl border border-cyan-400/20 bg-[rgba(10,16,28,0.7)] p-6 text-sm text-white/70">
          Need more help? Visit the{" "}
          <Link href="/support" className="text-cyan-300">
            support center
          </Link>{" "}
          or review our{" "}
          <Link href="/rules" className="text-cyan-300">
            tournament rules
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
