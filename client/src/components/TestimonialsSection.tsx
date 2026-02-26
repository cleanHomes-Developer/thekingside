/* ============================================================
   CLEANHOMES.PL — Testimonials Section
   Design: Warm cream bg, large quote marks, star ratings
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marta Kowalska",
    location: "Mokotów, Warszawa",
    rating: 5,
    pl: "Absolutnie zachwycona! Ekipa CleanHomes przybyła punktualnie, pracowała sprawnie i zostawiła moje mieszkanie w idealnym stanie. Polecam z całego serca!",
    en: "Absolutely delighted! The CleanHomes team arrived on time, worked efficiently, and left my apartment in perfect condition. I wholeheartedly recommend them!",
    initials: "MK",
  },
  {
    name: "Tomasz Wiśniewski",
    location: "Śródmieście, Warszawa",
    rating: 5,
    pl: "Korzystam z usług regularnie od roku. Zawsze profesjonalnie, zawsze czysto. Szczególnie doceniam ekologiczne środki — ważne dla mnie i moich dzieci.",
    en: "I've been using their services regularly for a year. Always professional, always clean. I especially appreciate the eco-friendly products — important for me and my children.",
    initials: "TW",
  },
  {
    name: "Anna Nowak",
    location: "Żoliborz, Warszawa",
    rating: 5,
    pl: "Zamówiłam sprzątanie po remoncie i jestem pod wrażeniem. Usunęli każdy ślad kurzu budowlanego. Mieszkanie wygląda jak nowe!",
    en: "I ordered post-renovation cleaning and I'm impressed. They removed every trace of construction dust. The apartment looks brand new!",
    initials: "AN",
  },
  {
    name: "Piotr Zając",
    location: "Ursynów, Warszawa",
    rating: 5,
    pl: "Świetna komunikacja, elastyczne terminy i doskonała jakość. Wreszcie firma, której mogę zaufać z kluczami do swojego domu.",
    en: "Great communication, flexible scheduling, and excellent quality. Finally a company I can trust with the keys to my home.",
    initials: "PZ",
  },
];

export default function TestimonialsSection() {
  const { lang, t } = useLanguage();
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

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "#F5F0E8" }}
      ref={sectionRef}
    >
      {/* Background section number */}
      <div className="absolute top-0 right-0 section-number select-none pointer-events-none leading-none pr-4 -mt-4">
        {t("testimonials.section")}
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <p
            className="text-[#F4A261] text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {t("testimonials.label")}
          </p>
          <h2
            className="text-[#1C1C1E] font-extrabold leading-tight"
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {t("testimonials.headline")}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((review, i) => (
            <div
              key={review.name}
              className="fade-in-up bg-white p-8 relative group hover:-translate-y-1 transition-transform duration-250"
              style={{ border: '3px solid #1C1C1E', transitionDelay: `${i * 100}ms` }}
            >
              {/* Large quote mark */}
              <span
                className="absolute top-4 right-6 text-7xl text-[#1B4332]/10 leading-none select-none"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                "
              </span>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="#F4A261" color="#F4A261" />
                ))}
              </div>

              {/* Review text */}
              <p
                className="text-[#1C1C1E]/80 leading-relaxed mb-6 relative z-10"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                "{lang === "pl" ? review.pl : review.en}"
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1B4332] flex items-center justify-center text-[#FEFBF3] text-sm font-bold shrink-0"
                  style={{ fontFamily: "Syne, sans-serif" }}>
                  {review.initials}
                </div>
                <div>
                  <p className="font-bold text-[#1C1C1E] text-sm" style={{ fontFamily: "Syne, sans-serif" }}>
                    {review.name}
                  </p>
                  <p className="text-[#1C1C1E]/50 text-xs" style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                    {review.location}
                  </p>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-[#F4A261] transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
