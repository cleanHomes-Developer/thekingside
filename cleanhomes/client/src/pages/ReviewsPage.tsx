// CLEANHOMES.PL — Reviews Page

import { Link } from "wouter";
import { Star, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { REVIEWS } from "@/lib/data";

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

export default function ReviewsPage() {
  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-muted/30">
        <div className="container text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Opinie klientów</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Co mówią nasi{" "}
            <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>klienci</em>
          </h1>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={22} className="fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-3xl font-bold text-foreground">{avgRating}</span>
          </div>
          <p className="text-muted-foreground">Ponad 2 000 zweryfikowanych opinii</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: "4.9/5", label: "Średnia ocena" },
              { value: "98%", label: "Zadowolonych klientów" },
              { value: "2 000+", label: "Opinii" },
              { value: "10 000+", label: "Wykonanych usług" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="section-pad">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.map((review) => (
              <div key={review.id} className="card-premium p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.service}</p>
                    </div>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">"{review.text}"</p>
                <p className="text-xs text-muted-foreground/60">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Dołącz do zadowolonych klientów</h2>
          <p className="text-white/70 mb-8">Zarezerwuj swoje pierwsze sprzątanie już dziś.</p>
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
