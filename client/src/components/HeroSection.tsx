/* ============================================================
   CLEANHOMES.PL — Hero Section
   Design: Full-bleed image, overlapping content box, bold typography
   Dark text on light image background
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, CheckCircle } from "lucide-react";

const HERO_IMAGE = "https://private-us-east-1.manuscdn.com/sessionFile/3SLN5Nb8PYWNBrxDVIhZtN/sandbox/SkFKNptGAZQtAMUPHwxLRs-img-1_1772108350000_na1fn_Y2xlYW5ob21lcy1oZXJv.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM1NMTjVOYjhQWVdOQnJ4RFZJaFp0Ti9zYW5kYm94L1NrRktOcHRHQVpRdEFNVVBId3hMUnMtaW1nLTFfMTc3MjEwODM1MDAwMF9uYTFmbl9ZMnhsWVc1b2IyMWxjeTFvWlhKdi5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=khZ1TW1Wvnc05qSZlrs-pwWa-pPRqv8VyxwEcEBk8GACfAMNr4oJDmc78unPUVBeTONolDd-xanSxX3we5gqbdFlEwv4vph4oZiExgiL3xrT8-1t6VVgl4UNG2UJbV8npO0Fatpevd-12NfH55rgLASdMspP8eIOkNrMHM7nZz6zOoC2QF2x9W3dHoV2AvGme8iMh5DYzSEphZdwX32y~o6DVdzGmr-Pu53wEJa10wd4KBL8KsCj6DYxbnbm-jW7QOtLCnejqWZ2oTIRQZnJbAnIdLcqLeV5shLAoR5xHp1-1ySBm-GoRyHn80PjHJ7IPrkRGVwSwXZYQ9fcLxTQ5A__";

export default function HeroSection() {
  const { t } = useLanguage();

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Professional home cleaning in Warsaw"
          className="w-full h-full object-cover"
        />
        {/* Light overlay to ensure text readability on this bright image */}
        <div className="absolute inset-0 bg-[#FEFBF3]/40" />
        {/* Left gradient for text area */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF3]/90 via-[#FEFBF3]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1B4332] text-[#FEFBF3] px-4 py-2 mb-6">
            <CheckCircle size={14} className="text-[#F4A261]" />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "Nunito Sans, sans-serif" }}>
              {t("hero.badge")}
            </span>
          </div>

          {/* Tagline */}
          <p
            className="text-[#1B4332] text-sm font-bold tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {t("hero.tagline")}
          </p>

          {/* Headline */}
          <h1
            className="text-[#1C1C1E] font-extrabold leading-[1.05] mb-6"
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            }}
          >
            {t("hero.headline")}
          </h1>

          {/* Subtext */}
          <p
            className="text-[#1C1C1E]/80 text-lg leading-relaxed mb-8 max-w-xl"
            style={{ fontFamily: "Nunito Sans, sans-serif" }}
          >
            {t("hero.subtext")}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => scrollTo("#contact")}
              className="btn-primary flex items-center gap-2"
            >
              {t("hero.cta.primary")}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollTo("#services")}
              className="btn-outline"
            >
              {t("hero.cta.secondary")}
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { val: t("hero.stat1"), label: t("hero.stat1.label") },
              { val: t("hero.stat2"), label: t("hero.stat2.label") },
              { val: t("hero.stat3"), label: t("hero.stat3.label") },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="text-3xl font-extrabold text-[#1B4332]"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {stat.val}
                </span>
                <span
                  className="text-xs text-[#1C1C1E]/70 font-semibold tracking-wide uppercase mt-1"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagonal bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-[#FEFBF3]"
        style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
      />
    </section>
  );
}
