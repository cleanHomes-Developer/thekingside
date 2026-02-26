/* ============================================================
   CLEANHOMES.PL — Services Section
   Design: Asymmetric grid, bold card borders, section number bg
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";
import { Sparkles, Home, Truck, Hammer, Wind, Building2 } from "lucide-react";

const services = [
  { key: "regular", icon: Home, color: "#1B4332" },
  { key: "deep", icon: Sparkles, color: "#F4A261" },
  { key: "moving", icon: Truck, color: "#1B4332" },
  { key: "renovation", icon: Hammer, color: "#F4A261" },
  { key: "windows", icon: Wind, color: "#1B4332" },
  { key: "office", icon: Building2, color: "#F4A261" },
];

export default function ServicesSection() {
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
    <section id="services" className="py-24 bg-[#FEFBF3] relative overflow-hidden" ref={sectionRef}>
      {/* Background section number */}
      <div className="absolute top-0 right-0 section-number select-none pointer-events-none leading-none pr-4 -mt-4">
        {t("services.section")}
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <p
            className="text-[#F4A261] text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {t("services.label")}
          </p>
          <h2
            className="text-[#1C1C1E] font-extrabold leading-tight mb-4"
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {t("services.headline")}
          </h2>
          <p
            className="text-[#1C1C1E]/70 text-lg leading-relaxed"
            style={{ fontFamily: "Nunito Sans, sans-serif" }}
          >
            {t("services.subtext")}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            const isGolden = service.color === "#F4A261";
            return (
              <div
                key={service.key}
                className={`fade-in-up card-bold bg-white p-8 group cursor-default`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 flex items-center justify-center mb-5 transition-all duration-250 group-hover:scale-110"
                  style={{ backgroundColor: isGolden ? "#F4A261" : "#1B4332" }}
                >
                  <Icon size={22} color={isGolden ? "#1C1C1E" : "#FEFBF3"} />
                </div>

                {/* Title */}
                <h3
                  className="text-[#1C1C1E] font-bold text-xl mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {t(`services.${service.key}.title`)}
                </h3>

                {/* Description */}
                <p
                  className="text-[#1C1C1E]/65 leading-relaxed"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                >
                  {t(`services.${service.key}.desc`)}
                </p>

                {/* Bottom accent line */}
                <div
                  className="mt-6 h-1 w-0 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: isGolden ? "#F4A261" : "#1B4332" }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
