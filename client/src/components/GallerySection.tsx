/* ============================================================
   CLEANHOMES.PL — Gallery / Visual Proof Section
   Design: Full-width image grid with living room and bathroom shots
   ============================================================ */
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";

const LIVING_IMAGE = "https://private-us-east-1.manuscdn.com/sessionFile/3SLN5Nb8PYWNBrxDVIhZtN/sandbox/SkFKNptGAZQtAMUPHwxLRs-img-4_1772108339000_na1fn_Y2xlYW5ob21lcy1saXZpbmc.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM1NMTjVOYjhQWVdOQnJ4RFZJaFp0Ti9zYW5kYm94L1NrRktOcHRHQVpRdEFNVVBId3hMUnMtaW1nLTRfMTc3MjEwODMzOTAwMF9uYTFmbl9ZMnhsWVc1b2IyMWxjeTFzYVhacGJtYy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=KlhfIiPbMiwbZrqfmBpFH1uYrtdOL32Cmfqls-B2r4JRM0tZJNjY2uoLt-kWWV1KRuI6q5WrUZ9W~vDBsChaGELxxiORf1Fs8o4bBeMSPrA5jzMiaQG1FdcfHzB1JFSd3aQwlc5s3BnfDqmNrmchXunviY8P-5GerkASi0pzel8Qeg0uFrgyutiQ42Abu7KeSH8NuicZP5U85~gCYBKbD-99y5U8xc4kX-BucsrAsuNN7Q6pINmKMQBsV8wkY0S8dIZ0XHuUpIvuNc1t0d~fAZ3ze9xrH7~CffbMjnWG59h5QCGqh8RBxM3golqAK7~Y67D2z5uc83i1hOdmDNNFjQ__";

const BATHROOM_IMAGE = "https://private-us-east-1.manuscdn.com/sessionFile/3SLN5Nb8PYWNBrxDVIhZtN/sandbox/SkFKNptGAZQtAMUPHwxLRs-img-3_1772108357000_na1fn_Y2xlYW5ob21lcy1iYXRocm9vbQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM1NMTjVOYjhQWVdOQnJ4RFZJaFp0Ti9zYW5kYm94L1NrRktOcHRHQVpRdEFNVVBId3hMUnMtaW1nLTNfMTc3MjEwODM1NzAwMF9uYTFmbl9ZMnhsWVc1b2IyMWxjeTFpWVhSb2NtOXZiUS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=L4ncPjCyWs2SMB2HCuDTMUBxLzHxxQ0smM66tfveglEbJhAxi7scFvFcl5~zZ0EIYQa1a7suEQlaxBzcvsB9ilV6tWbr8DrW7lHkFzO8Juo7znHdrU~S2V~2RhkX-AbkR7yQ20uz25sZAU50LQ02Fd9JgcCR-HgLVDia9cPoAHcMncjRtqFC5wkocqY7532A4yweltm21OP5uE8DIzZP7FoSw4FOZidlYnrTSiNQsy4bMKlq-z3Tn52ax3ePtJnyxfUeyxr7~cw3OlT5yCWSrZlxb4qUGQdH0A8pnF29nACKRJFafoX8EdberoqpLwAl9t9FSUQikhFAmWVVRrgyBg__";

export default function GallerySection() {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll(".fade-in-up");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-0 bg-[#FEFBF3]" ref={sectionRef}>
      {/* Full-width gallery strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Living room */}
        <div className="fade-in-up relative overflow-hidden group" style={{ height: "420px" }}>
          <img
            src={LIVING_IMAGE}
            alt="Professionally cleaned Warsaw apartment living room"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#1B4332]/0 group-hover:bg-[#1B4332]/30 transition-all duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-[#FEFBF3] border-2 border-[#1B4332] p-4 inline-block">
              <p className="text-[#1B4332] font-bold text-sm" style={{ fontFamily: "Syne, sans-serif" }}>
                {lang === "pl" ? "Salon — Po Sprzątaniu" : "Living Room — After Cleaning"}
              </p>
            </div>
          </div>
        </div>

        {/* Bathroom */}
        <div className="fade-in-up relative overflow-hidden group" style={{ height: "420px", transitionDelay: "100ms" }}>
          <img
            src={BATHROOM_IMAGE}
            alt="Professionally cleaned Warsaw apartment bathroom"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#1B4332]/0 group-hover:bg-[#1B4332]/30 transition-all duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-[#FEFBF3] border-2 border-[#1B4332] p-4 inline-block">
              <p className="text-[#1B4332] font-bold text-sm" style={{ fontFamily: "Syne, sans-serif" }}>
                {lang === "pl" ? "Łazienka — Po Sprzątaniu" : "Bathroom — After Cleaning"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="bg-[#F4A261] py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[#1C1C1E] font-extrabold text-xl"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {lang === "pl"
              ? "Gotowy na czyste mieszkanie? Zadzwoń teraz!"
              : "Ready for a clean home? Call us now!"}
          </p>
          <a
            href="tel:+48123456789"
            className="bg-[#1B4332] text-[#FEFBF3] font-bold px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#1C1C1E] transition-colors whitespace-nowrap"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            +48 123 456 789
          </a>
        </div>
      </div>
    </section>
  );
}
