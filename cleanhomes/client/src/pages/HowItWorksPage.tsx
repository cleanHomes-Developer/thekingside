// CLEANHOMES.PL — How It Works Page

import { Link } from "wouter";
import { Clock, CheckCircle, Sparkles, Shield, Star, ChevronRight, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STEPS = [
  {
    step: "01",
    icon: <Clock size={32} className="text-primary" />,
    title: "Skonfiguruj usługę",
    description: "Wybierz rodzaj sprzątania, liczbę pokojów i łazienek. Kalkulator pokaże Ci dokładną cenę w czasie rzeczywistym — bez żadnych ukrytych opłat.",
    details: [
      "Wybierz spośród 6 rodzajów usług",
      "Ustaw liczbę pokojów i łazienek",
      "Dodaj opcjonalne usługi dodatkowe",
      "Wybierz częstotliwość i skorzystaj z rabatu",
    ],
  },
  {
    step: "02",
    icon: <CheckCircle size={32} className="text-primary" />,
    title: "Zarezerwuj termin",
    description: "Wybierz datę i godzinę sprzątania. Podaj adres i dane kontaktowe. Płatność gotówką lub kartą — zawsze dopiero po wykonaniu usługi.",
    details: [
      "Dostępne terminy od następnego dnia",
      "Elastyczne godziny 7:30–20:00",
      "Płatność po wykonaniu usługi",
      "Bezpłatna zmiana do 24h przed",
    ],
  },
  {
    step: "03",
    icon: <Sparkles size={32} className="text-primary" />,
    title: "Ciesz się czystym domem",
    description: "Nasz zweryfikowany specjalista przyjedzie punktualnie z własnym sprzętem i środkami czystości. Wróć do nieskazitelnie czystego domu.",
    details: [
      "Specjalista przyjeżdża punktualnie",
      "Własny sprzęt i środki czystości",
      "Potwierdzenie SMS po zakończeniu",
      "Gwarancja satysfakcji 100%",
    ],
  },
];

const GUARANTEES = [
  {
    icon: <Shield size={24} className="text-primary" />,
    title: "Ubezpieczone usługi",
    desc: "Wszystkie nasze usługi są w pełni ubezpieczone. W przypadku ewentualnych szkód, jesteśmy w pełni odpowiedzialni.",
  },
  {
    icon: <Star size={24} className="text-primary" />,
    title: "Gwarancja satysfakcji",
    desc: "Jeśli cokolwiek nie spełnia Twoich oczekiwań, wrócimy i poprawimy bezpłatnie w ciągu 24 godzin.",
  },
  {
    icon: <CheckCircle size={24} className="text-primary" />,
    title: "Zweryfikowani specjaliści",
    desc: "Każdy specjalista przechodzi dokładną weryfikację tożsamości i szkolenie z technik sprzątania.",
  },
  {
    icon: <Clock size={24} className="text-primary" />,
    title: "Punktualność",
    desc: "Szanujemy Twój czas. W przypadku spóźnienia powyżej 30 minut, otrzymasz rabat na kolejne sprzątanie.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-muted/30">
        <div className="container text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Jak to działa</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Rezerwacja w{" "}
            <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>3 prostych krokach</em>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Profesjonalne sprzątanie nigdy nie było tak proste. Zarezerwuj online w 60 sekund.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-pad">
        <div className="container max-w-4xl">
          <div className="space-y-12">
            {STEPS.map((step, i) => (
              <div
                key={step.step}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="text-6xl font-bold text-primary/10 mb-2">{step.step}</div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">{step.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-5">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2.5 text-sm text-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <CheckCircle size={11} className="text-primary" />
                        </div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${i % 2 === 1 ? "md:order-1" : ""} flex items-center justify-center`}>
                  <div className="w-full max-w-xs aspect-square rounded-3xl bg-gradient-to-br from-primary/5 to-primary/15 border border-primary/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl font-bold text-primary/20">{step.step}</div>
                      <div className="mt-4">{step.icon}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="section-pad bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Nasze{" "}
              <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>gwarancje</em>
            </h2>
            <p className="text-muted-foreground">Twój spokój ducha jest dla nas priorytetem.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="card-premium p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {g.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{g.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Gotowy? Zacznijmy!</h2>
          <p className="text-white/70 mb-8">Pierwsza rezerwacja zajmuje tylko 60 sekund.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/rezerwacja"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors"
            >
              Zarezerwuj teraz <ChevronRight size={18} />
            </Link>
            <a
              href="https://wa.me/48123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
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
