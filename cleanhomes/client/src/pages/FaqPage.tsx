// CLEANHOMES.PL — FAQ Page

import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQ_ITEMS } from "@/lib/data";

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

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-muted/30">
        <div className="container text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">FAQ</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Często zadawane{" "}
            <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>pytania</em>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Znajdź odpowiedzi na najczęściej zadawane pytania. Jeśli nie znajdziesz odpowiedzi, skontaktuj się z nami.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad">
        <div className="container max-w-3xl">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {FAQ_ITEMS.map((cat, i) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === i
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            {FAQ_ITEMS[activeCategory].questions.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>

          {/* All categories */}
          <div className="mt-10 space-y-6">
            {FAQ_ITEMS.map((cat) => (
              <div key={cat.category}>
                <h3 className="text-lg font-bold text-foreground mb-3">{cat.category}</h3>
                <div className="bg-white rounded-2xl border border-border px-6">
                  {cat.questions.map((item) => (
                    <FaqItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="section-pad bg-muted/30">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Nie znalazłeś odpowiedzi?</h2>
          <p className="text-muted-foreground mb-6">
            Nasz zespół jest dostępny od poniedziałku do piątku w godzinach 8:00–20:00.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Skontaktuj się z nami <ChevronRight size={16} />
            </Link>
            <a
              href="https://wa.me/48123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
