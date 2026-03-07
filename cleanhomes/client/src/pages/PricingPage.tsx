// CLEANHOMES.PL — Pricing Page

import { Link } from "wouter";
import { Check, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PriceCalculator from "@/components/PriceCalculator";
import { ADDONS, FREQUENCY_OPTIONS, PRICING } from "@/lib/data";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-muted/30">
        <div className="container text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Cennik</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Przejrzyste ceny,{" "}
            <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>bez niespodzianek</em>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Cena zależy od liczby pokojów, nie od metrażu. Oblicz swoją cenę w kalkulatorze poniżej.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="section-pad">
        <div className="container max-w-2xl">
          <PriceCalculator />
        </div>
      </section>

      {/* Base pricing table */}
      <section className="section-pad bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Cennik podstawowy</h2>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 font-semibold text-foreground">Pozycja</th>
                  <th className="text-right px-5 py-3 font-semibold text-foreground">Cena</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-5 py-3 text-foreground">Pierwszy pokój (+ kuchnia + łazienka)</td>
                  <td className="px-5 py-3 text-right font-semibold text-primary">{PRICING.baseRoom.toFixed(2)} zł</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-5 py-3 text-foreground">Każdy kolejny pokój</td>
                  <td className="px-5 py-3 text-right font-semibold text-primary">+{PRICING.additionalRoom} zł</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-5 py-3 text-foreground">Każda kolejna łazienka</td>
                  <td className="px-5 py-3 text-right font-semibold text-primary">+{PRICING.bathroom} zł</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-foreground">Aneks kuchenny (zamiast pełnej kuchni)</td>
                  <td className="px-5 py-3 text-right font-semibold text-green-600">{PRICING.kitchenette} zł</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequency discounts */}
      <section className="section-pad">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Rabaty za częstotliwość</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FREQUENCY_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                className={`rounded-2xl border p-5 text-center ${
                  opt.id === "weekly"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white"
                }`}
              >
                {opt.id === "weekly" && (
                  <div className="text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5 mb-2 inline-block">
                    Najpopularniejszy
                  </div>
                )}
                <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                {opt.badge ? (
                  <p className="text-2xl font-bold text-primary mt-2">{opt.badge}</p>
                ) : (
                  <p className="text-2xl font-bold text-muted-foreground mt-2">—</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {opt.discount > 0 ? `${(opt.discount * 100).toFixed(0)}% taniej` : "Cena standardowa"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="section-pad bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Usługi dodatkowe</h2>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {ADDONS.map((addon, i) => (
                <div
                  key={addon.id}
                  className={`flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0 ${
                    i % 2 === 0 ? "" : "sm:border-l"
                  }`}
                >
                  <span className="text-sm text-foreground">{addon.label}</span>
                  <span className="text-sm font-semibold text-primary">{addon.price} zł</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Included */}
      <section className="section-pad">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Co jest zawsze w cenie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Wszystkie środki czystości",
              "Profesjonalny sprzęt sprzątający",
              "Ubezpieczenie usługi",
              "Zweryfikowany specjalista",
              "Gwarancja satysfakcji",
              "Bezpłatna zmiana terminu (>24h)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Gotowy na czysty dom?</h2>
          <p className="text-white/70 mb-8">Zarezerwuj usługę online w 60 sekund.</p>
          <Link
            href="/rezerwacja"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors"
          >
            Zarezerwuj teraz <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
