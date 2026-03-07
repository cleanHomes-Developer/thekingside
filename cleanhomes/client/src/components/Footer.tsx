// CLEANHOMES.PL Footer — Nordic Spa Minimalism

import { Link } from "wouter";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white text-xs font-bold">CH</span>
              </div>
              <span className="font-semibold text-lg">
                <span className="text-white/60">CLEAN</span>
                <span className="text-white">HOMES</span>
                <span className="text-white/40">.PL</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Profesjonalne sprzątanie mieszkań i biur w Warszawie. Twój dom, nieskazitelny. Twój czas, Twój.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/48123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Usługi</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/uslugi/sprzatanie-mieszkan", label: "Sprzątanie mieszkań" },
                { href: "/uslugi/gruntowne", label: "Gruntowne sprzątanie" },
                { href: "/uslugi/po-remoncie", label: "Sprzątanie po remoncie" },
                { href: "/uslugi/biura", label: "Sprzątanie biur" },
                { href: "/uslugi/okna", label: "Mycie okien" },
                { href: "/uslugi/tapicerka", label: "Pranie tapicerki" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Firma</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/jak-to-dziala", label: "Jak to działa" },
                { href: "/cennik", label: "Cennik" },
                { href: "/opinie", label: "Opinie klientów" },
                { href: "/faq", label: "Często zadawane pytania" },
                { href: "/kontakt", label: "Kontakt" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Kontakt</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+48123456789"
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone size={14} className="shrink-0" />
                  +48 123 456 789
                </a>
              </li>
              <li>
                <a
                  href="mailto:kontakt@cleanhomes.pl"
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Mail size={14} className="shrink-0" />
                  kontakt@cleanhomes.pl
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-sm text-white/60">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  <span>Warszawa i okolice</span>
                </div>
              </li>
            </ul>
            <div className="mt-5">
              <Link
                href="/rezerwacja"
                className="inline-block px-5 py-2.5 bg-white text-foreground text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors"
              >
                Zarezerwuj teraz
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} CLEANHOMES.PL. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-sm text-white/40 hover:text-white/60 transition-colors">
              Polityka prywatności
            </a>
            <a href="#" className="text-sm text-white/40 hover:text-white/60 transition-colors">
              Regulamin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
