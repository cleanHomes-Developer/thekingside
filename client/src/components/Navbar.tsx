/* ============================================================
   CLEANHOMES.PL — Navbar Component
   Design: Bold Brutalist Warmth | Forest Green + Warm Cream
   ============================================================ */
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { key: "nav.services", href: "#services" },
    { key: "nav.pricing", href: "#pricing" },
    { key: "nav.about", href: "#about" },
    { key: "nav.contact", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FEFBF3] shadow-md border-b-2 border-[#1B4332]"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-[#1B4332] flex items-center justify-center">
              <span className="text-[#F4A261] font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
                CH
              </span>
            </div>
            <span
              className="text-[#1B4332] font-bold text-xl tracking-tight"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Clean<span className="text-[#F4A261]">Homes</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollTo(link.href)}
                className={`nav-link text-sm font-semibold tracking-wide transition-colors ${
                  scrolled ? "text-[#1C1C1E]" : "text-[#1C1C1E]"
                } hover:text-[#1B4332]`}
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                {t(link.key)}
              </button>
            ))}
          </div>

          {/* Right side: Lang toggle + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center border-2 border-[#1B4332] overflow-hidden">
              <button
                onClick={() => setLang("pl")}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  lang === "pl"
                    ? "bg-[#1B4332] text-[#FEFBF3]"
                    : "bg-transparent text-[#1B4332] hover:bg-[#1B4332]/10"
                }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                PL
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  lang === "en"
                    ? "bg-[#1B4332] text-[#FEFBF3]"
                    : "bg-transparent text-[#1B4332] hover:bg-[#1B4332]/10"
                }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => scrollTo("#contact")}
              className="btn-primary text-sm"
            >
              {t("nav.book")}
            </button>
          </div>

          {/* Mobile: Lang + Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="flex items-center border-2 border-[#1B4332] overflow-hidden">
              <button
                onClick={() => setLang("pl")}
                className={`px-2 py-1 text-xs font-bold transition-colors ${
                  lang === "pl" ? "bg-[#1B4332] text-[#FEFBF3]" : "text-[#1B4332]"
                }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                PL
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 text-xs font-bold transition-colors ${
                  lang === "en" ? "bg-[#1B4332] text-[#FEFBF3]" : "text-[#1B4332]"
                }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#1B4332] p-1"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#FEFBF3] border-t-2 border-[#1B4332]">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollTo(link.href)}
                className="text-left text-[#1C1C1E] font-semibold py-2 border-b border-[#1B4332]/20 hover:text-[#1B4332] transition-colors"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                {t(link.key)}
              </button>
            ))}
            <button
              onClick={() => scrollTo("#contact")}
              className="btn-primary text-sm mt-2"
            >
              {t("nav.book")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
