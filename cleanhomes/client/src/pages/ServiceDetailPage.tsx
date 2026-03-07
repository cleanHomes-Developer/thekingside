// CLEANHOMES.PL — Service Detail Page

import { Link, useParams } from "wouter";
import { Check, ChevronRight, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SERVICES, REVIEWS } from "@/lib/data";

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const service = SERVICES.find((s) => s.slug === params.slug);

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Usługa nie znaleziona</h1>
          <Link href="/uslugi" className="text-primary hover:underline">Wróć do usług</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedReviews = REVIEWS.filter((r) =>
    r.service.toLowerCase().includes(service.title.toLowerCase().split(" ")[0].toLowerCase())
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 overflow-hidden">
        <div className="aspect-[21/6] relative">
          <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container pb-8">
            <nav className="flex items-center gap-2 text-white/70 text-xs mb-3">
              <Link href="/" className="hover:text-white">Strona główna</Link>
              <ChevronRight size={12} />
              <Link href="/uslugi" className="hover:text-white">Usługi</Link>
              <ChevronRight size={12} />
              <span className="text-white">{service.title}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{service.title}</h1>
            <p className="text-white/80 mt-2">{service.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">O usłudze</h2>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Co wchodzi w skład usługi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.includes.map((item) => (
                    <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {relatedReviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Opinie klientów</h2>
                  <div className="space-y-4">
                    {REVIEWS.slice(0, 3).map((review) => (
                      <div key={review.id} className="card-premium p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={12} className={i <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl border border-border p-6 space-y-5">
                <div>
                  <p className="text-xs text-muted-foreground">Cena od</p>
                  <p className="text-3xl font-bold text-primary">{service.priceFrom} zł</p>
                  <p className="text-xs text-muted-foreground mt-1">Wszystkie środki czystości w cenie</p>
                </div>

                <Link
                  href={`/rezerwacja?service=${service.slug}`}
                  className="block w-full text-center py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Zarezerwuj teraz
                </Link>

                <div className="space-y-2">
                  {[
                    "Zweryfikowani specjaliści",
                    "Ubezpieczone usługi",
                    "Gwarancja satysfakcji",
                    "Płatność po wykonaniu",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check size={12} className="text-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Inne usługi</p>
                  <div className="space-y-1">
                    {SERVICES.filter((s) => s.slug !== service.slug).slice(0, 4).map((s) => (
                      <Link
                        key={s.slug}
                        href={`/uslugi/${s.slug}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                      >
                        {s.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
