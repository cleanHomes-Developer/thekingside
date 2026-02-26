import { createContext, useContext, useState, ReactNode } from "react";

type Language = "pl" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pl: {
    // Navigation
    "nav.home": "Strona Główna",
    "nav.services": "Usługi",
    "nav.pricing": "Cennik",
    "nav.about": "O Nas",
    "nav.contact": "Kontakt",
    "nav.book": "Zamów Sprzątanie",

    // Hero
    "hero.tagline": "Czyste domy. Spokojny umysł.",
    "hero.headline": "Profesjonalne Sprzątanie Domów w Warszawie",
    "hero.subtext": "Oddaj swój dom w ręce ekspertów. Używamy ekologicznych środków czyszczących i gwarantujemy satysfakcję przy każdej wizycie.",
    "hero.cta.primary": "Zamów Teraz",
    "hero.cta.secondary": "Zobacz Usługi",
    "hero.badge": "Zaufało nam ponad 500 klientów w Warszawie",
    "hero.stat1": "500+",
    "hero.stat1.label": "Zadowolonych Klientów",
    "hero.stat2": "4.9★",
    "hero.stat2.label": "Średnia Ocena",
    "hero.stat3": "3+",
    "hero.stat3.label": "Lata Doświadczenia",

    // Services
    "services.section": "01",
    "services.label": "Nasze Usługi",
    "services.headline": "Kompleksowe Sprzątanie Domów",
    "services.subtext": "Oferujemy pełen zakres usług sprzątania dostosowanych do potrzeb Twojego domu lub mieszkania w Warszawie.",
    "services.regular.title": "Regularne Sprzątanie",
    "services.regular.desc": "Cotygodniowe lub dwutygodniowe wizyty utrzymujące Twój dom w nienagannej czystości. Odkurzanie, mycie podłóg, czyszczenie łazienek i kuchni.",
    "services.deep.title": "Generalne Porządki",
    "services.deep.desc": "Kompleksowe, dogłębne sprzątanie każdego zakątka Twojego domu. Idealne na wiosnę lub przed ważnym wydarzeniem.",
    "services.moving.title": "Sprzątanie po Przeprowadzce",
    "services.moving.desc": "Przygotujemy Twoje nowe mieszkanie do zamieszkania lub pozostawimy stare w idealnym stanie dla nowych lokatorów.",
    "services.renovation.title": "Sprzątanie po Remoncie",
    "services.renovation.desc": "Usuwamy kurz budowlany, resztki materiałów i przywracamy blask Twojemu wyremontowanemu wnętrzu.",
    "services.windows.title": "Mycie Okien",
    "services.windows.desc": "Profesjonalne mycie okien wewnątrz i na zewnątrz. Krystalicznie czyste szyby bez smug i zacieków.",
    "services.office.title": "Sprzątanie Biur",
    "services.office.desc": "Utrzymujemy czystość w małych biurach i przestrzeniach coworkingowych w Warszawie.",

    // How it works
    "how.section": "02",
    "how.label": "Jak To Działa",
    "how.headline": "Proste Jak 1, 2, 3",
    "how.step1.title": "Zamów Online",
    "how.step1.desc": "Wypełnij formularz lub zadzwoń do nas. Podaj adres, termin i zakres sprzątania.",
    "how.step2.title": "Nasz Zespół Przyjeżdża",
    "how.step2.desc": "Profesjonalni sprzątacze przybywają punktualnie z własnym sprzętem i środkami czyszczącymi.",
    "how.step3.title": "Ciesz Się Czystością",
    "how.step3.desc": "Wróć do idealnie czystego domu i ciesz się wolnym czasem. Gwarantujemy Twoją satysfakcję.",

    // Pricing
    "pricing.section": "03",
    "pricing.label": "Cennik",
    "pricing.headline": "Przejrzyste Ceny",
    "pricing.subtext": "Bez ukrytych opłat. Cena zależy od wielkości mieszkania i zakresu prac.",
    "pricing.basic.name": "Podstawowy",
    "pricing.basic.price": "od 149 zł",
    "pricing.basic.desc": "Idealne dla małych mieszkań do 40m²",
    "pricing.basic.f1": "Odkurzanie i mycie podłóg",
    "pricing.basic.f2": "Czyszczenie łazienki",
    "pricing.basic.f3": "Czyszczenie kuchni",
    "pricing.basic.f4": "Ścieranie kurzu",
    "pricing.standard.name": "Standardowy",
    "pricing.standard.price": "od 249 zł",
    "pricing.standard.desc": "Najpopularniejszy — mieszkania 40–80m²",
    "pricing.standard.f1": "Wszystko z pakietu Podstawowego",
    "pricing.standard.f2": "Mycie okien od wewnątrz",
    "pricing.standard.f3": "Czyszczenie sprzętu AGD",
    "pricing.standard.f4": "Zmiana pościeli",
    "pricing.standard.f5": "Wyniesienie śmieci",
    "pricing.premium.name": "Premium",
    "pricing.premium.price": "od 399 zł",
    "pricing.premium.desc": "Domy i duże mieszkania powyżej 80m²",
    "pricing.premium.f1": "Wszystko z pakietu Standardowego",
    "pricing.premium.f2": "Mycie okien na zewnątrz",
    "pricing.premium.f3": "Czyszczenie szaf i szuflad",
    "pricing.premium.f4": "Pranie dywanów",
    "pricing.premium.f5": "Priorytetowy termin wizyty",
    "pricing.cta": "Zamów Ten Pakiet",
    "pricing.popular": "Najpopularniejszy",

    // Testimonials
    "testimonials.section": "04",
    "testimonials.label": "Opinie Klientów",
    "testimonials.headline": "Co Mówią Nasi Klienci",

    // About
    "about.section": "05",
    "about.label": "O Nas",
    "about.headline": "Pasja do Czystości od 2021 Roku",
    "about.text1": "CleanHomes to warszawska firma sprzątająca założona przez ludzi, którzy wierzą, że czysty dom to szczęśliwy dom. Nasz zespół doświadczonych specjalistów obsługuje mieszkańców Warszawy z najwyższą starannością i profesjonalizmem.",
    "about.text2": "Używamy wyłącznie ekologicznych środków czyszczących, bezpiecznych dla dzieci, zwierząt i środowiska. Każdy z naszych pracowników przeszedł dokładne szkolenie i weryfikację.",
    "about.value1": "Ekologiczne środki",
    "about.value2": "Ubezpieczony zespół",
    "about.value3": "Gwarancja satysfakcji",
    "about.value4": "Punktualność",

    // Contact / Booking
    "contact.section": "06",
    "contact.label": "Kontakt",
    "contact.headline": "Zamów Sprzątanie",
    "contact.subtext": "Wypełnij formularz, a skontaktujemy się z Tobą w ciągu 2 godzin.",
    "contact.name": "Imię i Nazwisko",
    "contact.email": "Adres E-mail",
    "contact.phone": "Numer Telefonu",
    "contact.address": "Adres (ulica, dzielnica)",
    "contact.service": "Rodzaj Usługi",
    "contact.date": "Preferowany Termin",
    "contact.message": "Dodatkowe Informacje",
    "contact.submit": "Wyślij Zapytanie",
    "contact.phone.label": "Telefon",
    "contact.phone.value": "+48 123 456 789",
    "contact.email.label": "Email",
    "contact.email.value": "kontakt@cleanhomes.pl",
    "contact.area.label": "Obszar Działania",
    "contact.area.value": "Warszawa i okolice",
    "contact.hours.label": "Godziny Pracy",
    "contact.hours.value": "Pon–Sob: 8:00–20:00",
    "contact.success": "Dziękujemy! Skontaktujemy się wkrótce.",
    "contact.select.placeholder": "Wybierz usługę",

    // Footer
    "footer.tagline": "Czyste domy. Spokojny umysł.",
    "footer.rights": "Wszelkie prawa zastrzeżone.",
    "footer.privacy": "Polityka Prywatności",
    "footer.terms": "Regulamin",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.book": "Book a Cleaning",

    // Hero
    "hero.tagline": "Clean homes. Peaceful minds.",
    "hero.headline": "Professional Home Cleaning in Warsaw",
    "hero.subtext": "Put your home in the hands of experts. We use eco-friendly cleaning products and guarantee your satisfaction on every visit.",
    "hero.cta.primary": "Book Now",
    "hero.cta.secondary": "Our Services",
    "hero.badge": "Trusted by 500+ clients across Warsaw",
    "hero.stat1": "500+",
    "hero.stat1.label": "Happy Clients",
    "hero.stat2": "4.9★",
    "hero.stat2.label": "Average Rating",
    "hero.stat3": "3+",
    "hero.stat3.label": "Years Experience",

    // Services
    "services.section": "01",
    "services.label": "Our Services",
    "services.headline": "Comprehensive Home Cleaning",
    "services.subtext": "We offer a full range of cleaning services tailored to the needs of your home or apartment in Warsaw.",
    "services.regular.title": "Regular Cleaning",
    "services.regular.desc": "Weekly or bi-weekly visits keeping your home spotless. Vacuuming, floor washing, bathroom and kitchen cleaning.",
    "services.deep.title": "Deep Cleaning",
    "services.deep.desc": "Comprehensive, thorough cleaning of every corner of your home. Perfect for spring cleaning or before an important event.",
    "services.moving.title": "Move-In / Move-Out",
    "services.moving.desc": "We'll prepare your new apartment for move-in or leave your old one in perfect condition for the next tenants.",
    "services.renovation.title": "Post-Renovation Cleaning",
    "services.renovation.desc": "We remove construction dust, material remnants, and restore the shine to your newly renovated interior.",
    "services.windows.title": "Window Cleaning",
    "services.windows.desc": "Professional window cleaning inside and out. Crystal-clear glass without streaks or marks.",
    "services.office.title": "Office Cleaning",
    "services.office.desc": "We maintain cleanliness in small offices and coworking spaces across Warsaw.",

    // How it works
    "how.section": "02",
    "how.label": "How It Works",
    "how.headline": "Simple As 1, 2, 3",
    "how.step1.title": "Book Online",
    "how.step1.desc": "Fill out the form or call us. Provide your address, preferred date, and scope of cleaning.",
    "how.step2.title": "Our Team Arrives",
    "how.step2.desc": "Professional cleaners arrive on time with their own equipment and cleaning supplies.",
    "how.step3.title": "Enjoy the Cleanliness",
    "how.step3.desc": "Return to a perfectly clean home and enjoy your free time. We guarantee your satisfaction.",

    // Pricing
    "pricing.section": "03",
    "pricing.label": "Pricing",
    "pricing.headline": "Transparent Pricing",
    "pricing.subtext": "No hidden fees. Price depends on apartment size and scope of work.",
    "pricing.basic.name": "Basic",
    "pricing.basic.price": "from 149 PLN",
    "pricing.basic.desc": "Ideal for small apartments up to 40m²",
    "pricing.basic.f1": "Vacuuming and floor washing",
    "pricing.basic.f2": "Bathroom cleaning",
    "pricing.basic.f3": "Kitchen cleaning",
    "pricing.basic.f4": "Dusting",
    "pricing.standard.name": "Standard",
    "pricing.standard.price": "from 249 PLN",
    "pricing.standard.desc": "Most popular — apartments 40–80m²",
    "pricing.standard.f1": "Everything in Basic",
    "pricing.standard.f2": "Interior window cleaning",
    "pricing.standard.f3": "Appliance cleaning",
    "pricing.standard.f4": "Linen change",
    "pricing.standard.f5": "Trash removal",
    "pricing.premium.name": "Premium",
    "pricing.premium.price": "from 399 PLN",
    "pricing.premium.desc": "Houses and large apartments over 80m²",
    "pricing.premium.f1": "Everything in Standard",
    "pricing.premium.f2": "Exterior window cleaning",
    "pricing.premium.f3": "Wardrobe and drawer cleaning",
    "pricing.premium.f4": "Carpet cleaning",
    "pricing.premium.f5": "Priority scheduling",
    "pricing.cta": "Book This Package",
    "pricing.popular": "Most Popular",

    // Testimonials
    "testimonials.section": "04",
    "testimonials.label": "Client Reviews",
    "testimonials.headline": "What Our Clients Say",

    // About
    "about.section": "05",
    "about.label": "About Us",
    "about.headline": "A Passion for Cleanliness Since 2021",
    "about.text1": "CleanHomes is a Warsaw-based cleaning company founded by people who believe that a clean home is a happy home. Our team of experienced specialists serves Warsaw residents with the utmost care and professionalism.",
    "about.text2": "We use only eco-friendly cleaning products, safe for children, pets, and the environment. Each of our employees has undergone thorough training and background verification.",
    "about.value1": "Eco-friendly products",
    "about.value2": "Insured team",
    "about.value3": "Satisfaction guarantee",
    "about.value4": "Punctuality",

    // Contact / Booking
    "contact.section": "06",
    "contact.label": "Contact",
    "contact.headline": "Book a Cleaning",
    "contact.subtext": "Fill out the form and we'll contact you within 2 hours.",
    "contact.name": "Full Name",
    "contact.email": "Email Address",
    "contact.phone": "Phone Number",
    "contact.address": "Address (street, district)",
    "contact.service": "Service Type",
    "contact.date": "Preferred Date",
    "contact.message": "Additional Information",
    "contact.submit": "Send Inquiry",
    "contact.phone.label": "Phone",
    "contact.phone.value": "+48 123 456 789",
    "contact.email.label": "Email",
    "contact.email.value": "contact@cleanhomes.pl",
    "contact.area.label": "Service Area",
    "contact.area.value": "Warsaw and surroundings",
    "contact.hours.label": "Working Hours",
    "contact.hours.value": "Mon–Sat: 8:00–20:00",
    "contact.success": "Thank you! We'll be in touch shortly.",
    "contact.select.placeholder": "Select a service",

    // Footer
    "footer.tagline": "Clean homes. Peaceful minds.",
    "footer.rights": "All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("pl");

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
