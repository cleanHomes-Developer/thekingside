/* ============================================================
   CLEANHOMES.PL — Pricing Section
   Design: Three-tier pricing cards, bold borders, golden highlight
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

export default function PricingSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    const cards = sectionRef.current?.querySelectorAll(".fade-in-up");
    cards?.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const plans = [
    {
      key: "basic",
      features: ["basic.f1", "basic.f2", "basic.f3", "basic.f4"],
      popular: false,
    },
    {
      key: "standard",
      features: ["standard.f1", "standard.f2", "standard.f3", "standard.f4", "standard.f5"],
      popular: true,
    },
    {
      key: "premium",
      features: ["premium.f1", "premium.f2", "premium.f3", "premium.f4", "premium.f5"],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#FEFBF3] relative overflow-hidden" ref={sectionRef}>
      {/* Background section number */}
      <div className="absolute top-0 left-0 section-number select-none pointer-events-none leading-none pl-4 -mt-4">
        {t("pricing.section")}
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-[#F4A261] text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {t("pricing.label")}
          </p>
          <h2
            className="text-[#1C1C1E] font-extrabold leading-tight mb-4"
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {t("pricing.headline")}
          </h2>
          <p
            className="text-[#1C1C1E]/65 text-lg max-w-xl mx-auto"
            style={{ fontFamily: "Nunito Sans, sans-serif" }}
          >
            {t("pricing.subtext")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <div
              key={plan.key}
              className={`fade-in-up relative p-8 transition-all duration-250 ${
                plan.popular
                  ? "bg-[#1B4332] text-[#FEFBF3] -mt-4 shadow-2xl"
                  : "bg-white card-bold"
              }`}
              style={plan.popular ? { border: '4px solid #F4A261', transitionDelay: `${i * 100}ms` } : { transitionDelay: `${i * 100}ms` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F4A261] text-[#1C1C1E] px-4 py-1 text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "Syne, sans-serif" }}>
                  {t("pricing.popular")}
                </div>
              )}

              {/* Plan name */}
              <p
                className={`text-xs font-bold tracking-[0.25em] uppercase mb-2 ${
                  plan.popular ? "text-[#F4A261]" : "text-[#1B4332]"
                }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {t(`pricing.${plan.key}.name`)}
              </p>

              {/* Price */}
              <div className="mb-2">
                <span
                  className={`font-extrabold ${plan.popular ? "text-[#FEFBF3]" : "text-[#1C1C1E]"}`}
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                  }}
                >
                  {t(`pricing.${plan.key}.price`)}
                </span>
              </div>

              {/* Description */}
              <p
                className={`text-sm mb-6 pb-6 border-b ${
                  plan.popular
                    ? "text-[#FEFBF3]/70 border-[#FEFBF3]/20"
                    : "text-[#1C1C1E]/60 border-[#1C1C1E]/15"
                }`}
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                {t(`pricing.${plan.key}.desc`)}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((fKey) => (
                  <li key={fKey} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${plan.popular ? "text-[#F4A261]" : "text-[#1B4332]"}`}
                    />
                    <span
                      className={`text-sm ${plan.popular ? "text-[#FEFBF3]/85" : "text-[#1C1C1E]/75"}`}
                      style={{ fontFamily: "Nunito Sans, sans-serif" }}
                    >
                      {t(`pricing.${fKey}`)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={scrollToContact}
                className={`w-full py-3 font-bold text-sm tracking-widest uppercase transition-all duration-250 ${
                  plan.popular
                    ? "bg-[#F4A261] text-[#1C1C1E] hover:bg-[#e8924f] hover:shadow-lg"
                    : "bg-[#1B4332] text-[#FEFBF3] hover:bg-[#1C1C1E] hover:shadow-md"
                }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {t("pricing.cta")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
