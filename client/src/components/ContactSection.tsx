/* ============================================================
   CLEANHOMES.PL — Contact / Booking Section
   Design: Dark green bg, form on left, contact info on right
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ContactSection() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    service: "",
    date: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate form submission
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    toast.success(t("contact.success"));
    setForm({ name: "", email: "", phone: "", address: "", service: "", date: "", message: "" });
  };

  const contactInfo = [
    { icon: Phone, labelKey: "contact.phone.label", valueKey: "contact.phone.value" },
    { icon: Mail, labelKey: "contact.email.label", valueKey: "contact.email.value" },
    { icon: MapPin, labelKey: "contact.area.label", valueKey: "contact.area.value" },
    { icon: Clock, labelKey: "contact.hours.label", valueKey: "contact.hours.value" },
  ];

  const serviceOptions = [
    { pl: "Regularne Sprzątanie", en: "Regular Cleaning" },
    { pl: "Generalne Porządki", en: "Deep Cleaning" },
    { pl: "Sprzątanie po Przeprowadzce", en: "Move-In / Move-Out" },
    { pl: "Sprzątanie po Remoncie", en: "Post-Renovation Cleaning" },
    { pl: "Mycie Okien", en: "Window Cleaning" },
    { pl: "Sprzątanie Biur", en: "Office Cleaning" },
  ];

  const { lang } = useLanguage();

  const inputClass = `w-full bg-[#FEFBF3]/10 border-2 border-[#FEFBF3]/30 text-[#FEFBF3] placeholder-[#FEFBF3]/40 px-4 py-3 focus:outline-none focus:border-[#F4A261] transition-colors`;

  return (
    <section
      id="contact"
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "#1B4332" }}
    >
      {/* Background section number */}
      <div
        className="absolute top-0 right-0 section-number select-none pointer-events-none leading-none pr-4 -mt-4"
        style={{ color: "rgba(254,251,243,0.06)" }}
      >
        {t("contact.section")}
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-[#F4A261] text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {t("contact.label")}
          </p>
          <h2
            className="text-[#FEFBF3] font-extrabold leading-tight mb-3"
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {t("contact.headline")}
          </h2>
          <p
            className="text-[#FEFBF3]/65 text-lg"
            style={{ fontFamily: "Nunito Sans, sans-serif" }}
          >
            {t("contact.subtext")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#FEFBF3]/70 text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                  {t("contact.name")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jan Kowalski"
                  className={inputClass}
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                />
              </div>
              <div>
                <label className="block text-[#FEFBF3]/70 text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                  {t("contact.phone")}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+48 123 456 789"
                  className={inputClass}
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#FEFBF3]/70 text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                  {t("contact.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="jan@example.com"
                  className={inputClass}
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                />
              </div>
              <div>
                <label className="block text-[#FEFBF3]/70 text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                  {t("contact.date")}
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`${inputClass} [color-scheme:dark]`}
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#FEFBF3]/70 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                {t("contact.address")}
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="ul. Marszałkowska 1, Śródmieście"
                className={inputClass}
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-[#FEFBF3]/70 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                {t("contact.service")}
              </label>
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className={`${inputClass} appearance-none`}
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                <option value="" disabled style={{ background: "#1B4332" }}>
                  {t("contact.select.placeholder")}
                </option>
                {serviceOptions.map((opt) => (
                  <option key={opt.pl} value={opt.pl} style={{ background: "#1B4332" }}>
                    {lang === "pl" ? opt.pl : opt.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#FEFBF3]/70 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                {t("contact.message")}
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder={lang === "pl" ? "Np. mam 2 psy, potrzebuję szczególnej uwagi na kuchnię..." : "E.g. I have 2 dogs, need special attention to the kitchen..."}
                className={inputClass}
                style={{ fontFamily: "Nunito Sans, sans-serif", resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-accent w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "..." : t("contact.submit")}
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.labelKey}
                  className="flex items-start gap-4 bg-[#FEFBF3]/8 border border-[#FEFBF3]/15 p-5"
                >
                  <div className="w-10 h-10 bg-[#F4A261] flex items-center justify-center shrink-0">
                    <Icon size={18} color="#1C1C1E" />
                  </div>
                  <div>
                    <p
                      className="text-[#F4A261] text-xs font-bold uppercase tracking-wider mb-1"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {t(info.labelKey)}
                    </p>
                    <p
                      className="text-[#FEFBF3] font-semibold"
                      style={{ fontFamily: "Nunito Sans, sans-serif" }}
                    >
                      {t(info.valueKey)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Trust badge */}
            <div className="mt-6 border-2 border-[#F4A261] p-5">
              <p
                className="text-[#F4A261] font-extrabold text-lg mb-1"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {lang === "pl" ? "100% Satysfakcji" : "100% Satisfaction"}
              </p>
              <p
                className="text-[#FEFBF3]/70 text-sm leading-relaxed"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                {lang === "pl"
                  ? "Jeśli nie jesteś zadowolony, wrócimy i poprawimy bezpłatnie."
                  : "If you're not satisfied, we'll come back and fix it for free."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
