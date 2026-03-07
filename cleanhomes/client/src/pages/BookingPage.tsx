// CLEANHOMES.PL — 4-Step Booking Page
// Step 1: Configure | Step 2: Schedule | Step 3: Location | Step 4: Confirm

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Minus, Plus, Check, ChevronRight, ChevronLeft, Star, Shield, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SERVICES, ADDONS, FREQUENCY_OPTIONS, calculatePrice } from "@/lib/data";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

interface BookingState {
  serviceSlug: string;
  rooms: number;
  bathrooms: number;
  kitchenType: "full" | "kitchenette";
  frequency: string;
  selectedAddons: string[];
  date: string;
  time: string;
  city: string;
  street: string;
  postalCode: string;
  buildingNumber: string;
  apartmentNumber: string;
  floor: string;
  entryCode: string;
  firstName: string;
  phone: string;
  email: string;
  notes: string;
  paymentMethod: "cash" | "card";
  promoCode: string;
}

const TIMES = ["7:30","8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

function getDatesForMonth() {
  const today = new Date();
  const dates: { date: Date; discount: number | null }[] = [];
  for (let i = 1; i <= 35; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Simulate some discounts on certain dates
    const discount = [1,3,5].includes(d.getDay()) ? 20 : null;
    dates.push({ date: d, discount });
  }
  return dates;
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
}

const STEP_LABELS = ["Usługa", "Termin", "Adres", "Potwierdzenie"];

export default function BookingPage() {
  const [search] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  const [state, setState] = useState<BookingState>({
    serviceSlug: "sprzatanie-mieszkan",
    rooms: 2,
    bathrooms: 1,
    kitchenType: "full",
    frequency: "weekly",
    selectedAddons: [],
    date: "",
    time: "",
    city: "Warszawa",
    street: "",
    postalCode: "",
    buildingNumber: "",
    apartmentNumber: "",
    floor: "",
    entryCode: "",
    firstName: "",
    phone: "",
    email: "",
    notes: "",
    paymentMethod: "card",
    promoCode: "",
  });

  // Parse URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rooms = params.get("rooms");
    const bathrooms = params.get("bathrooms");
    const kitchen = params.get("kitchen");
    const frequency = params.get("frequency");
    setState((s) => ({
      ...s,
      rooms: rooms ? parseInt(rooms) : s.rooms,
      bathrooms: bathrooms ? parseInt(bathrooms) : s.bathrooms,
      kitchenType: (kitchen as "full" | "kitchenette") || s.kitchenType,
      frequency: frequency || s.frequency,
    }));
  }, []);

  const { total, savings } = calculatePrice(
    state.rooms, state.bathrooms, state.kitchenType, state.frequency, state.selectedAddons
  );

  const dates = getDatesForMonth();

  const toggleAddon = (id: string) => {
    setState((s) => ({
      ...s,
      selectedAddons: s.selectedAddons.includes(id)
        ? s.selectedAddons.filter((a) => a !== id)
        : [...s.selectedAddons, id],
    }));
  };

  const handleSubmit = () => {
    if (!state.firstName || !state.email || !state.phone) {
      toast.error("Proszę wypełnić wszystkie wymagane pola.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-32 pb-20 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Rezerwacja przyjęta!</h1>
          <p className="text-muted-foreground mb-2">
            Dziękujemy, <strong>{state.firstName}</strong>! Twoja rezerwacja została złożona.
          </p>
          <p className="text-muted-foreground mb-6">
            Potwierdzenie wysłaliśmy na adres <strong>{state.email}</strong>.
          </p>
          <div className="bg-muted/50 rounded-2xl border border-border p-5 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usługa</span>
              <span className="font-medium">{SERVICES.find(s => s.slug === state.serviceSlug)?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Termin</span>
              <span className="font-medium">{formatDisplayDate(state.date)}, {state.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Adres</span>
              <span className="font-medium">{state.street} {state.buildingNumber}, {state.city}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
              <span>Do zapłaty</span>
              <span className="text-primary">{total.toFixed(2)} zł</span>
            </div>
          </div>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Wróć na stronę główną
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-24 pb-16">
        {/* Step indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const stepNum = (i + 1) as Step;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? "bg-primary text-white"
                          : isActive
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? <Check size={12} /> : stepNum}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`flex-1 h-px ${isDone ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Main form */}
          <div className="lg:col-span-2">
            {/* Step 1 */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
                <h2 className="text-xl font-bold text-foreground">Wybierz usługę</h2>

                {/* Service selector */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Rodzaj usługi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.slice(0, 4).map((svc) => (
                      <button
                        key={svc.slug}
                        onClick={() => setState((s) => ({ ...s, serviceSlug: svc.slug }))}
                        className={`p-3 rounded-xl border text-left text-sm transition-all ${
                          state.serviceSlug === svc.slug
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="font-medium">{svc.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">od {svc.priceFrom} zł</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm font-medium">Pokoje</p>
                    <p className="text-xs text-muted-foreground">Sypialnie i pokoje dzienne</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setState(s => ({ ...s, rooms: Math.max(1, s.rooms - 1) }))}
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-semibold">{state.rooms}</span>
                    <button onClick={() => setState(s => ({ ...s, rooms: Math.min(8, s.rooms + 1) }))}
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm font-medium">Łazienki</p>
                    <p className="text-xs text-muted-foreground">Łazienki i toalety</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setState(s => ({ ...s, bathrooms: Math.max(1, s.bathrooms - 1) }))}
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-semibold">{state.bathrooms}</span>
                    <button onClick={() => setState(s => ({ ...s, bathrooms: Math.min(4, s.bathrooms + 1) }))}
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Kitchen */}
                <div>
                  <p className="text-sm font-medium mb-2">Kuchnia</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "full", label: "Pełna kuchnia" },
                      { value: "kitchenette", label: "Aneks kuchenny (-10 zł)" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setState(s => ({ ...s, kitchenType: opt.value as "full" | "kitchenette" }))}
                        className={`py-2.5 px-3 rounded-xl text-sm border transition-all ${
                          state.kitchenType === opt.value
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <p className="text-sm font-medium mb-3">Usługi dodatkowe (opcjonalnie)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ADDONS.map((addon) => (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                          state.selectedAddons.includes(addon.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            state.selectedAddons.includes(addon.id)
                              ? "bg-primary border-primary"
                              : "border-border"
                          }`}>
                            {state.selectedAddons.includes(addon.id) && <Check size={10} className="text-white" />}
                          </div>
                          <span className="text-xs">{addon.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-primary">{addon.price} zł</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  Dalej: Wybierz termin
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
                <h2 className="text-xl font-bold text-foreground">Wybierz termin</h2>

                {/* Date picker */}
                <div>
                  <p className="text-sm font-medium mb-3">Data sprzątania</p>
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                    {dates.slice(0, 28).map(({ date, discount }) => {
                      const dateStr = formatDate(date);
                      const isSelected = state.date === dateStr;
                      const dayNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setState(s => ({ ...s, date: dateStr }))}
                          className={`relative p-2 rounded-xl text-center transition-all border ${
                            isSelected
                              ? "bg-primary text-white border-primary"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          <div className="text-xs text-current/60">{dayNames[date.getDay()]}</div>
                          <div className="text-sm font-semibold">{date.getDate()}</div>
                          {discount && !isSelected && (
                            <div className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold px-1 rounded-full">
                              -{discount}%
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time picker */}
                {state.date && (
                  <div>
                    <p className="text-sm font-medium mb-3">Godzina</p>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {TIMES.map((time) => (
                        <button
                          key={time}
                          onClick={() => setState(s => ({ ...s, time }))}
                          className={`py-2 px-1 rounded-xl text-sm border transition-all ${
                            state.time === time
                              ? "bg-primary text-white border-primary"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Frequency */}
                <div>
                  <p className="text-sm font-medium mb-3">Częstotliwość</p>
                  <div className="space-y-2">
                    {FREQUENCY_OPTIONS.map((opt) => {
                      const { total: optTotal } = calculatePrice(
                        state.rooms, state.bathrooms, state.kitchenType, opt.id, state.selectedAddons
                      );
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setState(s => ({ ...s, frequency: opt.id }))}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            state.frequency === opt.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              state.frequency === opt.id ? "border-primary" : "border-border"
                            }`}>
                              {state.frequency === opt.id && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="text-sm font-medium">{opt.label}</span>
                            {opt.badge && (
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground">{optTotal.toFixed(2)} zł</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Wstecz
                  </button>
                  <button
                    onClick={() => {
                      if (!state.date || !state.time) {
                        toast.error("Wybierz datę i godzinę sprzątania.");
                        return;
                      }
                      setStep(3);
                    }}
                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    Dalej: Adres
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
                <h2 className="text-xl font-bold text-foreground">Adres i dane kontaktowe</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Miasto", key: "city", placeholder: "Warszawa" },
                    { label: "Ulica", key: "street", placeholder: "ul. Marszałkowska" },
                    { label: "Kod pocztowy", key: "postalCode", placeholder: "00-001" },
                    { label: "Numer budynku", key: "buildingNumber", placeholder: "12" },
                    { label: "Numer mieszkania", key: "apartmentNumber", placeholder: "5" },
                    { label: "Piętro", key: "floor", placeholder: "2" },
                    { label: "Numer klatki", key: "entryCode", placeholder: "B" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-foreground mb-1 block">{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={(state as any)[field.key]}
                        onChange={(e) => setState(s => ({ ...s, [field.key]: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Dane kontaktowe</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Imię *</label>
                      <input
                        type="text"
                        placeholder="Anna"
                        value={state.firstName}
                        onChange={(e) => setState(s => ({ ...s, firstName: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Telefon *</label>
                      <div className="flex">
                        <span className="px-3 py-2.5 bg-muted border border-r-0 border-border rounded-l-xl text-sm text-muted-foreground">+48</span>
                        <input
                          type="tel"
                          placeholder="123 456 789"
                          value={state.phone}
                          onChange={(e) => setState(s => ({ ...s, phone: e.target.value }))}
                          className="flex-1 px-4 py-2.5 rounded-r-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-foreground mb-1 block">E-mail *</label>
                      <input
                        type="email"
                        placeholder="anna@example.com"
                        value={state.email}
                        onChange={(e) => setState(s => ({ ...s, email: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-foreground mb-1 block">Dodatkowe informacje</label>
                      <textarea
                        placeholder="Np. kod do domofonu, specjalne instrukcje..."
                        value={state.notes}
                        onChange={(e) => setState(s => ({ ...s, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Wstecz
                  </button>
                  <button
                    onClick={() => {
                      if (!state.street || !state.buildingNumber) {
                        toast.error("Proszę podać adres sprzątania.");
                        return;
                      }
                      setStep(4);
                    }}
                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    Dalej: Potwierdzenie
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
                <h2 className="text-xl font-bold text-foreground">Potwierdzenie zamówienia</h2>

                {/* Payment method */}
                <div>
                  <p className="text-sm font-medium mb-3">Metoda płatności</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "card", label: "Karta / Apple Pay / Google Pay" },
                      { value: "cash", label: "Gotówka przy wykonaniu" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setState(s => ({ ...s, paymentMethod: opt.value as "cash" | "card" }))}
                        className={`p-3.5 rounded-xl border text-sm text-left transition-all ${
                          state.paymentMethod === opt.value
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo code */}
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Kod rabatowy (opcjonalnie)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Wpisz kod"
                      value={state.promoCode}
                      onChange={(e) => setState(s => ({ ...s, promoCode: e.target.value }))}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    <button className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
                      Zastosuj
                    </button>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-3 py-3 border-y border-border">
                  {[
                    { icon: <Shield size={14} />, label: "Ubezpieczone" },
                    { icon: <Leaf size={14} />, label: "Środki w cenie" },
                    { icon: <Star size={14} />, label: "Gwarancja jakości" },
                  ].map((b) => (
                    <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="text-primary">{b.icon}</span>
                      {b.label}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Składając zamówienie akceptujesz{" "}
                  <a href="#" className="text-primary hover:underline">Regulamin</a>{" "}
                  i{" "}
                  <a href="#" className="text-primary hover:underline">Politykę prywatności</a>.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Wstecz
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Zamawiam za {total.toFixed(2)} zł
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-border p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Podsumowanie</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usługa</span>
                  <span className="font-medium text-right text-xs">
                    {SERVICES.find(s => s.slug === state.serviceSlug)?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pokoje</span>
                  <span className="font-medium">{state.rooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Łazienki</span>
                  <span className="font-medium">{state.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Częstotliwość</span>
                  <span className="font-medium text-xs text-right">
                    {FREQUENCY_OPTIONS.find(f => f.id === state.frequency)?.label}
                  </span>
                </div>
                {state.selectedAddons.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-muted-foreground mb-1">Dodatki:</p>
                    {state.selectedAddons.map((id) => {
                      const addon = ADDONS.find(a => a.id === id);
                      return addon ? (
                        <div key={id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{addon.label}</span>
                          <span>+{addon.price} zł</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                {state.date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Termin</span>
                    <span className="font-medium text-xs text-right">
                      {formatDisplayDate(state.date)}{state.time ? `, ${state.time}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {savings > 0 && (
                <div className="bg-primary/5 rounded-xl p-3 text-xs text-primary font-medium">
                  Oszczędzasz {savings.toFixed(2)} zł przy subskrypcji!
                </div>
              )}

              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Do zapłaty</span>
                  <span className="text-xl font-bold text-primary">{total.toFixed(2)} zł</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Płatność po wykonaniu usługi</p>
              </div>

              <div className="space-y-2">
                {[
                  "Wszystkie środki czystości w cenie",
                  "Ubezpieczone usługi",
                  "Gwarancja satysfakcji",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check size={12} className="text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
