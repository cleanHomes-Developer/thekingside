// CLEANHOMES.PL — Services Overview Page

import { Link } from "wouter";
import { ChevronRight, Home, Sparkles, Hammer, Building, Wind, Sofa } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SERVICES } from "@/lib/data";

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <Home size={28} />,
  sparkles: <Sparkles size={28} />,
  hammer: <Hammer size={28} />,
  building: <Building size={28} />,
  window: <Wind size={28} />,
  sofa: <Sofa size={28} />,
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-muted/30">
        <div className="container text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Nasze usługi</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Kompleksowa opieka{" "}
            <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>nad Twoim domem</em>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Oferujemy pełen zakres usług sprzątania — od regularnego sprzątania mieszkań po gruntowne czyszczenie po remoncie.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-pad">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div key={service.slug} className="card-premium overflow-hidden group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {ICON_MAP[service.icon]}
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">{service.title}</h2>
                      <p className="text-xs text-muted-foreground">{service.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                  <ul className="space-y-1.5 mb-5">
                    {service.includes.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                    {service.includes.length > 4 && (
                      <li className="text-xs text-primary font-medium">
                        +{service.includes.length - 4} więcej...
                      </li>
                    )}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">od {service.priceFrom} zł</span>
                    <Link
                      href={`/uslugi/${service.slug}`}
                      className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                    >
                      Szczegóły <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
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
