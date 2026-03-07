// =============================================================
// CLEANHOMES.PL — Shared data constants
// =============================================================

export const SERVICES = [
  {
    slug: "sprzatanie-mieszkan",
    title: "Sprzątanie Mieszkań",
    subtitle: "Kompleksowe sprzątanie Twojego domu",
    description: "Profesjonalne sprzątanie całego mieszkania — pokoje, kuchnia, łazienka, przedpokój. Wszystkie środki czystości w cenie.",
    priceFrom: 179,
    icon: "home",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/95019193/83aDYoCk6kpEy5XX6w9Rjm/hero-living-room_61022647.jpg",
    includes: [
      "Odkurzanie i mycie podłóg",
      "Ścieranie kurzu z mebli",
      "Mycie luster i szyb",
      "Czyszczenie kuchni i AGD",
      "Mycie i dezynfekcja łazienki",
      "Wynoszenie śmieci",
      "Ścielenie łóżek",
      "Mycie parapetów i kaloryferów",
    ],
  },
  {
    slug: "gruntowne",
    title: "Gruntowne Sprzątanie",
    subtitle: "Głębokie czyszczenie każdego kąta",
    description: "Intensywne, gruntowne sprzątanie dla mieszkań wymagających szczególnej uwagi. Idealne po długim czasie bez sprzątania.",
    priceFrom: 299,
    icon: "sparkles",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/95019193/83aDYoCk6kpEy5XX6w9Rjm/service-deep-clean_bbc80f9a.jpg",
    includes: [
      "Wszystko ze sprzątania standardowego",
      "Mycie wnętrza piekarnika",
      "Czyszczenie lodówki",
      "Mycie szafek kuchennych wewnątrz",
      "Mycie okien od wewnątrz",
      "Pranie fug i fugowanie",
      "Mycie okapu",
      "Dezynfekcja wszystkich powierzchni",
    ],
  },
  {
    slug: "po-remoncie",
    title: "Sprzątanie po Remoncie",
    subtitle: "Usuwanie pyłu i zabrudzeń budowlanych",
    description: "Specjalistyczne sprzątanie po pracach remontowych i budowlanych. Usuwamy pył, resztki materiałów i przywracamy blask.",
    priceFrom: 399,
    icon: "hammer",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/95019193/83aDYoCk6kpEy5XX6w9Rjm/service-bathroom_5d80bf25.jpg",
    includes: [
      "Usuwanie pyłu budowlanego",
      "Mycie okien po remoncie",
      "Czyszczenie podłóg z resztek materiałów",
      "Mycie wszystkich powierzchni",
      "Usuwanie plam farby i kleju",
      "Czyszczenie armatury",
      "Mycie drzwi i ościeżnic",
      "Wywóz odpadów remontowych (opcja)",
    ],
  },
  {
    slug: "biura",
    title: "Sprzątanie Biur",
    subtitle: "Czyste środowisko pracy dla Twojego zespołu",
    description: "Profesjonalne sprzątanie biur, open space i pomieszczeń komercyjnych. Elastyczne harmonogramy dopasowane do godzin pracy.",
    priceFrom: 249,
    icon: "building",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/95019193/83aDYoCk6kpEy5XX6w9Rjm/service-office_8c1d3173.jpg",
    includes: [
      "Odkurzanie i mycie podłóg",
      "Czyszczenie biurek i krzeseł",
      "Mycie okien i parapetów",
      "Dezynfekcja klamek i przełączników",
      "Czyszczenie kuchni biurowej",
      "Mycie toalet i łazienek",
      "Opróżnianie koszy na śmieci",
      "Porządkowanie przestrzeni wspólnych",
    ],
  },
  {
    slug: "okna",
    title: "Mycie Okien",
    subtitle: "Krystalicznie czyste okna",
    description: "Profesjonalne mycie okien wewnątrz i na zewnątrz. Używamy specjalistycznych środków bez smug.",
    priceFrom: 40,
    icon: "window",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/95019193/83aDYoCk6kpEy5XX6w9Rjm/service-bathroom_5d80bf25.jpg",
    includes: [
      "Mycie szyb od wewnątrz",
      "Mycie szyb od zewnątrz",
      "Czyszczenie ram okiennych",
      "Mycie parapetów",
      "Czyszczenie rolet i żaluzji",
      "Środki antysmugowe w cenie",
    ],
  },
  {
    slug: "tapicerka",
    title: "Pranie Tapicerki",
    subtitle: "Głębokie czyszczenie mebli tapicerowanych",
    description: "Chemiczne czyszczenie kanap, foteli, materacy i dywanów. Usuwamy plamy, alergeny i nieprzyjemne zapachy.",
    priceFrom: 150,
    icon: "sofa",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/95019193/83aDYoCk6kpEy5XX6w9Rjm/hero-living-room_61022647.jpg",
    includes: [
      "Pranie kanapy 2-osobowej od 150 zł",
      "Pranie kanapy 3-osobowej od 165 zł",
      "Pranie narożnika od 180 zł",
      "Pranie fotela od 50 zł",
      "Pranie materaca od 75 zł",
      "Pranie dywanu od 15 zł/m²",
      "Usuwanie plam i zabrudzeń",
      "Dezodoryzacja i odświeżenie",
    ],
  },
];

export const ADDONS = [
  { id: "piekarnik", label: "Mycie piekarnika", price: 40 },
  { id: "okap", label: "Mycie okapu", price: 40 },
  { id: "szafki", label: "Wnętrze szafek kuchennych", price: 65 },
  { id: "naczynia", label: "Mycie naczyń", price: 25 },
  { id: "lodowka", label: "Czyszczenie lodówki", price: 40 },
  { id: "mikrofalowka", label: "Mycie mikrofalówki", price: 18 },
  { id: "balkon", label: "Sprzątanie balkonu", price: 35 },
  { id: "okna", label: "Mycie okien", price: 40 },
  { id: "prasowanie", label: "Prasowanie", price: 50 },
  { id: "kuweta", label: "Sprzątanie kuwety", price: 10 },
  { id: "dodatkowe_godziny", label: "Dodatkowe godziny", price: 45 },
  { id: "szafa", label: "Porządek w szafie", price: 30 },
  { id: "zmywarka", label: "Mycie zmywarki", price: 50 },
  { id: "odkurzacz", label: "Odkurzacz (wynajem)", price: 28 },
];

export const FREQUENCY_OPTIONS = [
  { id: "weekly", label: "Raz w tygodniu", discount: 0.20, badge: "-20%" },
  { id: "biweekly", label: "Raz na 2 tygodnie", discount: 0.15, badge: "-15%" },
  { id: "monthly", label: "Raz w miesiącu", discount: 0.10, badge: "-10%" },
  { id: "once", label: "Jednorazowo", discount: 0, badge: null },
];

// Base pricing: per room + per bathroom
export const PRICING = {
  baseRoom: 89.95,       // first room
  additionalRoom: 36,    // each extra room
  bathroom: 25,          // each bathroom (first included)
  kitchenette: -10,      // discount for kitchenette vs full kitchen
};

export function calculatePrice(
  rooms: number,
  bathrooms: number,
  kitchenType: "full" | "kitchenette",
  frequency: string,
  selectedAddons: string[]
): { base: number; total: number; savings: number } {
  const freqOption = FREQUENCY_OPTIONS.find((f) => f.id === frequency) || FREQUENCY_OPTIONS[3];
  const basePrice =
    PRICING.baseRoom +
    Math.max(0, rooms - 1) * PRICING.additionalRoom +
    Math.max(0, bathrooms - 1) * PRICING.bathroom +
    (kitchenType === "kitchenette" ? PRICING.kitchenette : 0);

  const addonTotal = selectedAddons.reduce((sum, id) => {
    const addon = ADDONS.find((a) => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);

  const discountedBase = basePrice * (1 - freqOption.discount);
  const total = discountedBase + addonTotal;
  const savings = basePrice - discountedBase;

  return {
    base: Math.round(basePrice * 100) / 100,
    total: Math.round(total * 100) / 100,
    savings: Math.round(savings * 100) / 100,
  };
}

export const REVIEWS = [
  {
    id: 1,
    name: "Monika K.",
    rating: 5,
    date: "Luty 2026",
    service: "Sprzątanie mieszkania",
    text: "Dwie zadbane panie — sumienne i dobrze wykonujące swoją pracę. Jestem bardzo zadowolona z pomocy przy myciu okien i łazienek po remoncie. Z chęcią skorzystam ponownie!",
  },
  {
    id: 2,
    name: "Dzmitry W.",
    rating: 5,
    date: "Luty 2026",
    service: "Sprzątanie mieszkania",
    text: "Mieszkanie wysprzątane ekspresowo. Bardzo szybko i dokładnie. Polecam tę firmę z czystym sumieniem! Na pewno jeszcze skorzystam.",
  },
  {
    id: 3,
    name: "Maja S.",
    rating: 5,
    date: "Styczeń 2026",
    service: "Gruntowne sprzątanie",
    text: "Specjalistka przyszła punktualnie, bardzo dobrze wyczyściła toaletę, kuchnię i wszystkie pokoje. Bardzo zadbana i profesjonalna. Polecam!",
  },
  {
    id: 4,
    name: "Agnieszka P.",
    rating: 5,
    date: "Styczeń 2026",
    service: "Sprzątanie mieszkania",
    text: "Bardzo efektywny proces. Zamówiłam usługę wieczorem na kolejny dzień. Mieszkanie pięknie posprzątane. Polecam serdecznie.",
  },
  {
    id: 5,
    name: "Przemek R.",
    rating: 5,
    date: "Grudzień 2025",
    service: "Sprzątanie biura",
    text: "Niesamowicie miła Pani, bardzo sprawnie ogarnęła całe biuro. Wszystko bardzo profesjonalnie i na poziomie. Jestem niesamowicie wdzięczny!",
  },
  {
    id: 6,
    name: "Anna M.",
    rating: 5,
    date: "Grudzień 2025",
    service: "Mycie okien",
    text: "Jestem zadowolona ze sprzątania. Punktualność, szybkość pracy, ładny zapach środków. Wykonawca uprzejmy. Dziękuję.",
  },
  {
    id: 7,
    name: "Tomasz B.",
    rating: 5,
    date: "Listopad 2025",
    service: "Sprzątanie po remoncie",
    text: "Gruntowne sprzątanie po remoncie wykonane perfekcyjnie. Pył budowlany zniknął dosłownie wszędzie. Bardzo polecam!",
  },
  {
    id: 8,
    name: "Katarzyna Z.",
    rating: 4,
    date: "Listopad 2025",
    service: "Pranie tapicerki",
    text: "Kanapa jak nowa! Plamy po dzieciach zniknęły bez śladu. Profesjonalne podejście i szybka realizacja.",
  },
];

export const FAQ_ITEMS = [
  {
    category: "Rezerwacja i terminy",
    questions: [
      {
        q: "Jak szybko mogę zarezerwować sprzątanie?",
        a: "Rezerwację możesz złożyć online w ciągu 60 sekund. Dostępne terminy zaczynają się już od następnego dnia. W przypadku pilnych zleceń skontaktuj się z nami przez WhatsApp.",
      },
      {
        q: "Czy mogę zmienić lub anulować rezerwację?",
        a: "Tak, możesz zmienić lub anulować rezerwację bezpłatnie do 24 godzin przed planowanym sprzątaniem. Zmiany dokonasz przez swoje konto lub kontaktując się z nami.",
      },
      {
        q: "Co się dzieje, jeśli specjalista się spóźni?",
        a: "Informujemy Cię z wyprzedzeniem o ewentualnych opóźnieniach. W przypadku spóźnienia powyżej 30 minut, otrzymasz rabat na kolejne sprzątanie.",
      },
    ],
  },
  {
    category: "Ceny i płatność",
    questions: [
      {
        q: "Jak obliczana jest cena sprzątania?",
        a: "Cena zależy od liczby pokojów i łazienek, a nie od metrażu. Dzięki temu wiesz dokładnie, ile zapłacisz, zanim złożysz zamówienie. Częstsze sprzątanie = większy rabat.",
      },
      {
        q: "Kiedy płacę za usługę?",
        a: "Płatność następuje po wykonaniu usługi. Możesz zapłacić gotówką lub kartą online (Visa, Mastercard, Apple Pay, Google Pay).",
      },
      {
        q: "Czy są ukryte opłaty?",
        a: "Nie. Cena widoczna w kalkulatorze to cena ostateczna. Żadnych ukrytych opłat za dojazd, środki czystości czy sprzęt.",
      },
      {
        q: "Czy rabaty się łączą?",
        a: "Rabat za częstotliwość nie łączy się z innymi promocjami. Kod rabatowy można zastosować do jednorazowych zamówień.",
      },
    ],
  },
  {
    category: "Nasi specjaliści",
    questions: [
      {
        q: "Kto wykonuje sprzątanie?",
        a: "Nasi specjaliści to zweryfikowani, przeszkoleni profesjonaliści. Każdy przechodzi dokładną weryfikację tożsamości i szkolenie z technik sprzątania.",
      },
      {
        q: "Czy muszę być w domu podczas sprzątania?",
        a: "Nie musisz. Możesz zostawić klucz lub kod do domofonu w zamówieniu. Wielu klientów korzysta z usługi pod swoją nieobecność.",
      },
      {
        q: "Czy specjaliści przynoszą własny sprzęt?",
        a: "Tak. Każdy specjalista ma komplet profesjonalnych środków czystości i sprzętu. Jeśli potrzebujesz odkurzacza, możemy go dostarczyć za dodatkową opłatą 28 zł.",
      },
    ],
  },
  {
    category: "Jakość i gwarancja",
    questions: [
      {
        q: "Co jeśli nie jestem zadowolony z usługi?",
        a: "Gwarantujemy 100% satysfakcji. Jeśli coś nie spełnia Twoich oczekiwań, wrócimy i poprawimy bezpłatnie w ciągu 24 godzin.",
      },
      {
        q: "Czy usługi są ubezpieczone?",
        a: "Tak. Wszystkie nasze usługi są w pełni ubezpieczone. W przypadku ewentualnych szkód, jesteśmy w pełni odpowiedzialni.",
      },
    ],
  },
];
