/* ============================================================
   CLEANHOMES.PL — How It Works Section
   Design: Dark green background, diagonal clip, bold step numbers
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";
import { ClipboardList, Users, Smile } from "lucide-react";

const steps = [
  { icon: ClipboardList, num: "01" },
  { icon: Users, num: "02" },
  { icon: Smile, num: "03" },
];

export default function HowItWorksSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
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
      className="py-32 relative overflow-hidden"
      style={{
        backgroundColor: "#1B4332",
        clipPath: "polygon(0 5%, 100% 0, 100% 95%, 0 100%)",
        marginTop: "-3rem",
        paddingTop: "8rem",
        paddingBottom: "8rem",
      }}
      ref={sectionRef}
    >
      {/* Background section number */}
      <div
        className="absolute top-8 left-0 section-number select-none pointer-events-none leading-none pl-4"
        style={{ color: "rgba(254,251,243,0.07)" }}
      >
        {t("how.section")}
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-[#F4A261] text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {t("how.label")}
          </p>
          <h2
            className="text-[#FEFBF3] font-extrabold leading-tight"
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {t("how.headline")}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-0.5 bg-[#F4A261]/30 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="fade-in-up relative z-10 text-center"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Step number circle */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-24 h-24 border-2 border-[#F4A261] flex items-center justify-center bg-[#1B4332]">
                    <Icon size={32} color="#F4A261" />
                  </div>
                  <span
                    className="absolute -top-3 -right-3 w-8 h-8 bg-[#F4A261] flex items-center justify-center text-[#1C1C1E] text-xs font-extrabold"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {i + 1}
                  </span>
                </div>

                <h3
                  className="text-[#FEFBF3] font-bold text-xl mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {t(`how.step${i + 1}.title`)}
                </h3>
                <p
                  className="text-[#FEFBF3]/70 leading-relaxed"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                >
                  {t(`how.step${i + 1}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
