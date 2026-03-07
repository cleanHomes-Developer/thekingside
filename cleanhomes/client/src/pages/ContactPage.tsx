// CLEANHOMES.PL — Contact Page

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Proszę wypełnić wszystkie wymagane pola.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Wiadomość wysłana! Odpiszemy w ciągu 24 godzin.");
      setForm({ name: "", email: "", phone: "", message: "" });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-muted/30">
        <div className="container text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Kontakt</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Jesteśmy do{" "}
            <em style={{ fontFamily: "DM Serif Display, serif", fontStyle: "italic" }}>Twojej dyspozycji</em>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Masz pytania lub chcesz omówić szczegóły? Skontaktuj się z nami — odpiszemy w ciągu 24 godzin.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Dane kontaktowe</h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: <Phone size={20} className="text-primary" />,
                      label: "Telefon",
                      value: "+48 123 456 789",
                      href: "tel:+48123456789",
                    },
                    {
                      icon: <Mail size={20} className="text-primary" />,
                      label: "E-mail",
                      value: "kontakt@cleanhomes.pl",
                      href: "mailto:kontakt@cleanhomes.pl",
                    },
                    {
                      icon: <MessageCircle size={20} className="text-primary" />,
                      label: "WhatsApp",
                      value: "+48 123 456 789",
                      href: "https://wa.me/48123456789",
                    },
                    {
                      icon: <MapPin size={20} className="text-primary" />,
                      label: "Obszar działania",
                      value: "Warszawa i okolice",
                      href: null,
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-medium text-foreground">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Godziny obsługi klienta</h3>
                </div>
                <div className="space-y-1 text-sm">
                  {[
                    { day: "Poniedziałek – Piątek", hours: "8:00 – 20:00" },
                    { day: "Sobota", hours: "9:00 – 18:00" },
                    { day: "Niedziela", hours: "Zamknięte" },
                  ].map((row) => (
                    <div key={row.day} className="flex justify-between">
                      <span className="text-muted-foreground">{row.day}</span>
                      <span className="font-medium text-foreground">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-5">Wyślij wiadomość</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Imię i nazwisko *</label>
                    <input
                      type="text"
                      placeholder="Anna Kowalska"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Telefon</label>
                    <input
                      type="tel"
                      placeholder="+48 123 456 789"
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">E-mail *</label>
                  <input
                    type="email"
                    placeholder="anna@example.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Wiadomość *</label>
                  <textarea
                    placeholder="W czym możemy Ci pomóc?"
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 active:scale-[0.98] transition-all"
                >
                  {sending ? "Wysyłanie..." : "Wyślij wiadomość"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
