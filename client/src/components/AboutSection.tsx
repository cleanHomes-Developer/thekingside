/* ============================================================
   CLEANHOMES.PL — About Section
   Design: Split layout — text left, team image right, value badges
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";
import { Leaf, Shield, ThumbsUp, Clock } from "lucide-react";

const TEAM_IMAGE = "https://private-us-east-1.manuscdn.com/sessionFile/3SLN5Nb8PYWNBrxDVIhZtN/sandbox/SkFKNptGAZQtAMUPHwxLRs-img-2_1772108347000_na1fn_Y2xlYW5ob21lcy10ZWFt.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM1NMTjVOYjhQWVdOQnJ4RFZJaFp0Ti9zYW5kYm94L1NrRktOcHRHQVpRdEFNVVBId3hMUnMtaW1nLTJfMTc3MjEwODM0NzAwMF9uYTFmbl9ZMnhsWVc1b2IyMWxjeTEwWldGdC5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=LBwF~vrHzCto079pzoOWAwydoGcfTDcNiauMLxFt4epaO8-ev-efkV0CQLjTH6M5EYUMGPjXnp-K~B4lIHQqgD9AL3Nz-HAISZV-9tLGlyAyWWwGEKILdxh66r9uWcSB0beJWr~Km2qdp3lVtIFm--PVlESm1lf~e-tbkJtfvBifM6F-Z2QMuOI4G-hdzWH6htDIHJCBHurhrROEkLtmAdztWvZlm5E7-bkGvg5RfO-qzuhGBbR7UWAZQyzFf8JE7pG91d~ffQ8KCVb56Lcvp3oaup3HlbaGEmAsv5RQx24FHmAlSt-NTcghrRxqE4p4aZHG8hmrOm-mt5CmkRFjZg__";

const values = [
  { icon: Leaf, key: "about.value1" },
  { icon: Shield, key: "about.value2" },
  { icon: ThumbsUp, key: "about.value3" },
  { icon: Clock, key: "about.value4" },
];

export default function AboutSection() {
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
    const els = sectionRef.current?.querySelectorAll(".fade-in-up");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-24 bg-[#FEFBF3] relative overflow-hidden" ref={sectionRef}>
      {/* Background section number */}
      <div className="absolute top-0 left-0 section-number select-none pointer-events-none leading-none pl-4 -mt-4">
        {t("about.section")}
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div className="fade-in-up">
            <p
              className="text-[#F4A261] text-xs font-bold tracking-[0.3em] uppercase mb-3"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {t("about.label")}
            </p>
            <h2
              className="text-[#1C1C1E] font-extrabold leading-tight mb-6"
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              }}
            >
              {t("about.headline")}
            </h2>

            <p
              className="text-[#1C1C1E]/70 leading-relaxed mb-4 text-lg"
              style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
              {t("about.text1")}
            </p>
            <p
              className="text-[#1C1C1E]/70 leading-relaxed mb-10 text-lg"
              style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
              {t("about.text2")}
            </p>

            {/* Value badges */}
            <div className="grid grid-cols-2 gap-4">
              {values.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.key}
                    className="flex items-center gap-3 bg-white border-2 border-[#1B4332] p-4"
                  >
                    <div className="w-9 h-9 bg-[#1B4332] flex items-center justify-center shrink-0">
                      <Icon size={16} color="#F4A261" />
                    </div>
                    <span
                      className="text-[#1C1C1E] font-semibold text-sm"
                      style={{ fontFamily: "Nunito Sans, sans-serif" }}
                    >
                      {t(val.key)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Team image */}
          <div className="fade-in-up relative" style={{ transitionDelay: "150ms" }}>
            <div className="relative">
              {/* Offset border decoration */}
              <div className="absolute -top-4 -right-4 w-full h-full border-4 border-[#F4A261] z-0" />
              <img
                src={TEAM_IMAGE}
                alt="CleanHomes professional cleaning team in Warsaw"
                className="relative z-10 w-full object-cover"
                style={{ maxHeight: "480px" }}
              />
              {/* Overlay badge */}
              <div className="absolute bottom-6 left-6 z-20 bg-[#1B4332] p-4 border-2 border-[#F4A261]">
                <p className="text-[#F4A261] font-extrabold text-2xl" style={{ fontFamily: "Syne, sans-serif" }}>
                  500+
                </p>
                <p className="text-[#FEFBF3]/80 text-xs font-semibold tracking-wide uppercase" style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                  {t("hero.stat1.label")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
