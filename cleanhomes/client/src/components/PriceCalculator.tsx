// CLEANHOMES.PL — Price Calculator Widget
// Real-time price calculation with rooms, bathrooms, frequency, add-ons

import { useState } from "react";
import { useLocation } from "wouter";
import { Minus, Plus, ChevronRight } from "lucide-react";
import { FREQUENCY_OPTIONS, calculatePrice } from "@/lib/data";

interface PriceCalculatorProps {
  compact?: boolean; // hero mode (compact) vs full booking mode
}

export default function PriceCalculator({ compact = false }: PriceCalculatorProps) {
  const [rooms, setRooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [kitchenType, setKitchenType] = useState<"full" | "kitchenette">("full");
  const [frequency, setFrequency] = useState("weekly");
  const [, navigate] = useLocation();

  const { total, savings } = calculatePrice(rooms, bathrooms, kitchenType, frequency, []);
  const freqOption = FREQUENCY_OPTIONS.find((f) => f.id === frequency)!;

  const handleBook = () => {
    const params = new URLSearchParams({
      rooms: String(rooms),
      bathrooms: String(bathrooms),
      kitchen: kitchenType,
      frequency,
    });
    navigate(`/rezerwacja?${params.toString()}`);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-border overflow-hidden ${compact ? "" : "max-w-lg"}`}>
      {/* Header */}
      <div className="bg-primary px-6 py-4">
        <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Oblicz cenę</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-white">{total.toFixed(2)} zł</span>
          {savings > 0 && (
            <span className="text-white/60 text-sm line-through">
              {(total + savings).toFixed(2)} zł
            </span>
          )}
        </div>
        {savings > 0 && (
          <p className="text-white/70 text-xs mt-0.5">Oszczędzasz {savings.toFixed(2)} zł przy subskrypcji</p>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Rooms */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Pokoje</p>
            <p className="text-xs text-muted-foreground">Liczba pokojów dziennych i sypialni</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRooms(Math.max(1, rooms - 1))}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-primary/30 transition-colors"
              aria-label="Zmniejsz liczbę pokojów"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-semibold text-foreground">{rooms}</span>
            <button
              onClick={() => setRooms(Math.min(8, rooms + 1))}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-primary/30 transition-colors"
              aria-label="Zwiększ liczbę pokojów"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Bathrooms */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Łazienki</p>
            <p className="text-xs text-muted-foreground">Łazienki i toalety</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-primary/30 transition-colors"
              aria-label="Zmniejsz liczbę łazienek"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-semibold text-foreground">{bathrooms}</span>
            <button
              onClick={() => setBathrooms(Math.min(4, bathrooms + 1))}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-primary/30 transition-colors"
              aria-label="Zwiększ liczbę łazienek"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Kitchen type */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Kuchnia</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setKitchenType("full")}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                kitchenType === "full"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-border hover:border-primary/40"
              }`}
            >
              Pełna kuchnia
            </button>
            <button
              onClick={() => setKitchenType("kitchenette")}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                kitchenType === "kitchenette"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-border hover:border-primary/40"
              }`}
            >
              Aneks (-10 zł)
            </button>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Częstotliwość</p>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFrequency(opt.id)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                  frequency === opt.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:border-primary/40"
                }`}
              >
                <span className="block">{opt.label}</span>
                {opt.badge && (
                  <span className={`text-xs font-bold ${frequency === opt.id ? "text-white/80" : "text-primary"}`}>
                    {opt.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleBook}
          className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          Zarezerwuj za {total.toFixed(2)} zł
          <ChevronRight size={18} />
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Wszystkie środki czystości w cenie · Bez ukrytych opłat
        </p>
      </div>
    </div>
  );
}
