/* ============================================================
   CLEANHOMES.PL — Floating CTA Button
   Design: Fixed bottom-right phone button with pulse animation
   ============================================================ */
import { Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FloatingCTA() {
  const { lang } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Label */}
      <div className="bg-[#1C1C1E] text-[#FEFBF3] px-3 py-1.5 text-xs font-semibold opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:block"
        style={{ fontFamily: "Nunito Sans, sans-serif" }}>
        {lang === "pl" ? "Zadzwoń teraz" : "Call now"}
      </div>

      {/* Phone button */}
      <a
        href="tel:+48123456789"
        className="group relative w-14 h-14 bg-[#1B4332] flex items-center justify-center shadow-xl hover:bg-[#F4A261] transition-colors duration-250"
        aria-label={lang === "pl" ? "Zadzwoń do nas" : "Call us"}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 bg-[#1B4332] opacity-30 animate-ping" />
        <Phone size={22} color="#FEFBF3" className="group-hover:text-[#1C1C1E] relative z-10 group-hover:stroke-[#1C1C1E]" />
      </a>
    </div>
  );
}
