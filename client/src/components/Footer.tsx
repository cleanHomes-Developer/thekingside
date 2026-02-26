/* ============================================================
   CLEANHOMES.PL — Footer
   Design: Dark charcoal bg, golden accents, clean layout
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const { t, lang } = useLanguage();

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlaceholder = () => {
    toast.info(lang === "pl" ? "Funkcja wkrótce dostępna" : "Feature coming soon");
  };

  return (
    <footer style={{ backgroundColor: "#1C1C1E" }}>
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#1B4332] flex items-center justify-center">
                <span className="text-[#F4A261] font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
                  CH
                </span>
              </div>
              <span
                className="text-[#FEFBF3] font-bold text-xl tracking-tight"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Clean<span className="text-[#F4A261]">Homes</span>
              </span>
            </div>
            <p
              className="text-[#FEFBF3]/55 leading-relaxed mb-6 max-w-sm"
              style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
              {t("footer.tagline")}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[#FEFBF3]/55">
                <Phone size={14} className="text-[#F4A261]" />
                <span className="text-sm" style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                  {t("contact.phone.value")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#FEFBF3]/55">
                <Mail size={14} className="text-[#F4A261]" />
                <span className="text-sm" style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                  {t("contact.email.value")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#FEFBF3]/55">
                <MapPin size={14} className="text-[#F4A261]" />
                <span className="text-sm" style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                  {t("contact.area.value")}
                </span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-[#FEFBF3] font-bold text-sm tracking-widest uppercase mb-5"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {t("nav.services")}
            </h4>
            <ul className="space-y-3">
              {["regular", "deep", "moving", "renovation", "windows", "office"].map((key) => (
                <li key={key}>
                  <button
                    onClick={() => scrollTo("#services")}
                    className="text-[#FEFBF3]/50 hover:text-[#F4A261] text-sm transition-colors text-left"
                    style={{ fontFamily: "Nunito Sans, sans-serif" }}
                  >
                    {t(`services.${key}.title`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-[#FEFBF3] font-bold text-sm tracking-widest uppercase mb-5"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {lang === "pl" ? "Firma" : "Company"}
            </h4>
            <ul className="space-y-3">
              {[
                { label: t("nav.about"), href: "#about" },
                { label: t("nav.pricing"), href: "#pricing" },
                { label: t("nav.contact"), href: "#contact" },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-[#FEFBF3]/50 hover:text-[#F4A261] text-sm transition-colors text-left"
                    style={{ fontFamily: "Nunito Sans, sans-serif" }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={handlePlaceholder}
                  className="text-[#FEFBF3]/50 hover:text-[#F4A261] text-sm transition-colors text-left"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                >
                  {t("footer.privacy")}
                </button>
              </li>
              <li>
                <button
                  onClick={handlePlaceholder}
                  className="text-[#FEFBF3]/50 hover:text-[#F4A261] text-sm transition-colors text-left"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                >
                  {t("footer.terms")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#FEFBF3]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[#FEFBF3]/35 text-sm"
            style={{ fontFamily: "Nunito Sans, sans-serif" }}
          >
            © {new Date().getFullYear()} CleanHomes.pl — {t("footer.rights")}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#1B4332] rounded-full animate-pulse" />
            <span
              className="text-[#FEFBF3]/35 text-xs"
              style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
              {lang === "pl" ? "Aktywni w Warszawie" : "Active in Warsaw"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
