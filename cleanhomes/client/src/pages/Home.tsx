// CLEANHOMES.PL — Homepage
// Design: Nordic Spa Minimalism
// Sections: Hero, Social Proof Strip, Trust Badges, Services, How It Works, Pricing, Reviews, FAQ, CTA

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Shield, Star, CheckCircle, Clock, Sparkles, Home as HomeIcon,
  Building, Wind, Sofa, Hammer, ChevronDown, ChevronRight,
  MessageCircle, Award, Leaf, CreditCard
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PriceCalculator from "@/components/PriceCalculator";
import { SERVICES, REVIEWS, FAQ_ITEMS } from "@/lib/data";

// ── Scroll reveal hook ──────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ── Service icon map ────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  home: <HomeIcon size={22} />,
  sparkles: <Sparkles size={22} />,
  hammer: <Hammer size={22} />,
  building: <Building size={22} />,
  window: <Wind size={22} />,
  sofa: <Sofa size={22} />,
};

// ── Star rating ─────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? "fill-amber-400 text-amber-400" : "text-muted"}
        />
      ))}
    </div>
  );
}

// ── FAQ Accordion Item ──────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-primary transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────
export default function HomePage() {
  const [activeFaqCat, setActiveFaqCat] = useState(0);
  const servicesRef = useReveal();
  const howRef = useReveal();
  const reviewsRef = useReveal();
  const ctaRef = useReveal();

  const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/95019193/83aDYoCk6kpEy5XX6w9Rjm/hero-living-room_61022647.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Czyste, eleganckie wnętrze mieszkania"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        </div>

        <div className="relative z-10 container pt-24 pb-16">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-white/90 text-xs font-medium">4.9/5 · Ponad 2 000 opinii</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Twój dom,{" "}
              <em className="not-italic text-white/80" style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>
                nieskazitelny.
              </em>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              Profesjonalne sprzątanie mieszkań w Warszawie. Rezerwacja online w 60 sekund, stałe ceny, gwarancja satysfakcji.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle size={15} className="text-white/60" />
                Wszystkie środki w cenie
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle size={15} className="text-white/60" />
                Ubezpieczone usługi
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle size={15} className="text-white/60" />
                Gwarancja satysfakcji
              </div>
            </div>
          </div>

          {/* Calculator card */}
          <div className="w-full max-w-sm">
            <PriceCalculator compact />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ───────────────────────────── */}
      <section className="bg-primary py-4">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { value: "10 000+", label: "Wykonanych sprzątań" },
              { value: "4.9/5", label: "Średnia ocena" },
              { value: "98%", label: "Zadowolonych klientów" },
              { value: "24h", label: "Czas odpowiedzi" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────────────── */}
      <section className="section-pad bg-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <CreditCard size={24} className="text-primary" />,
                title: "Stała cena",
                desc: "Cena zależy od liczby pokojów, nie od metrażu",
              },
              {
                icon: <Shield size={24} className="text-primary" />,
                title: "Ubezpieczone usługi",
                desc: "Płatność dopiero po wykonaniu sprzątania",
              },
              {
                icon: <Leaf size={24} className="text-primary" />,
                title: "Środki w cenie",
                desc: "Profesjonalne środki czystości zawsze w cenie",
              },
              {
                icon: <Award size={24} className="text-primary" />,
                title: "Gwarancja jakości",
                desc: "100% satysfakcji lub wrócimy i poprawimy",
              },
            ].map((badge) => (
              <div
                key={badge.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/50 border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {badge.icon}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{badge.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────── */}
      <section className="section-pad bg-muted/30">
        <div className="container">
          <div ref={servicesRef} className="reveal text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Nasze usługi</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Kompleksowa opieka<br />
              <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>nad Twoim domem</em>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Od regularnego sprzątania po gruntowne czyszczenie po remoncie — mamy usługę dopasowaną do każdej potrzeby.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((service, i) => (
              <Link
                key={service.slug}
                href={`/uslugi/${service.slug}`}
                className="card-premium group overflow-hidden block"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {ICON_MAP[service.icon]}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{service.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">od {service.priceFrom} zł</span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                      Dowiedz się więcej <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/uslugi"
              className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary text-sm font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
            >
              Zobacz wszystkie usługi
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section
        className="section-pad relative overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/95019193/83aDYoCk6kpEy5XX6w9Rjm/how-it-works-bg_c897eec3.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative container">
          <div ref={howRef} className="reveal text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Jak to działa</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Rezerwacja w{" "}
              <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>3 prostych krokach</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                step: "01",
                title: "Skonfiguruj",
                desc: "Wybierz usługę, liczbę pokojów i termin. Kalkulator pokaże Ci dokładną cenę od razu.",
                icon: <Clock size={24} className="text-primary" />,
              },
              {
                step: "02",
                title: "Zarezerwuj",
                desc: "Podaj adres i dane kontaktowe. Płatność gotówką lub kartą — dopiero po sprzątaniu.",
                icon: <CheckCircle size={24} className="text-primary" />,
              },
              {
                step: "03",
                title: "Ciesz się",
                desc: "Nasz specjalista przyjedzie punktualnie. Wróć do czystego, świeżego domu.",
                icon: <Sparkles size={24} className="text-primary" />,
              },
            ].map((step, i) => (
              <div key={step.step} className="text-center relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px border-t-2 border-dashed border-primary/20" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-border flex items-center justify-center mx-auto mb-4 relative z-10">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-primary/40 mb-1">{step.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/jak-to-dziala"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              Dowiedz się więcej <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ──────────────────────────────── */}
      <section className="section-pad bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Cennik</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Przejrzyste ceny,{" "}
              <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>bez niespodzianek</em>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Cena zależy od liczby pokojów, nie od metrażu. Częstsze sprzątanie = większy rabat.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <PriceCalculator />
          </div>

          <div className="text-center mt-8">
            <Link
              href="/cennik"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              Pełny cennik z dodatkami <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────── */}
      <section className="section-pad bg-muted/30">
        <div className="container">
          <div ref={reviewsRef} className="reveal text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Opinie klientów</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Co mówią nasi{" "}
              <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>klienci</em>
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-amber-400 text-amber-400" />)}
              </div>
              <span className="font-bold text-foreground">4.9</span>
              <span className="text-muted-foreground text-sm">· Ponad 2 000 opinii</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.slice(0, 6).map((review) => (
              <div key={review.id} className="card-premium p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.service}</p>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{review.text}"</p>
                <p className="text-xs text-muted-foreground/60 mt-3">{review.date}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/opinie"
              className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary text-sm font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
            >
              Wszystkie opinie
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="section-pad bg-background">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Często zadawane{" "}
              <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>pytania</em>
            </h2>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {FAQ_ITEMS.map((cat, i) => (
              <button
                key={cat.category}
                onClick={() => setActiveFaqCat(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFaqCat === i
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            {FAQ_ITEMS[activeFaqCat].questions.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              Wszystkie pytania <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="section-pad bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/10" />
        </div>
        <div ref={ctaRef} className="reveal relative container text-center">
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-4">Gotowy na czysty dom?</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Zarezerwuj pierwsze sprzątanie
            <br />
            <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>już dziś</em>
          </h2>
          <p className="text-white/70 max-w-md mx-auto mb-8">
            Rezerwacja zajmuje 60 sekund. Bez zobowiązań — możesz anulować w każdej chwili.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/rezerwacja"
              className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg"
            >
              Zarezerwuj teraz
            </Link>
            <a
              href="https://wa.me/48123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
            >
              <MessageCircle size={18} />
              Napisz na WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
