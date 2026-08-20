"use client";

import { useRef, useState } from "react";
import { useCmsData } from "@/hooks/use-cms-data";
import { motion, useInView } from "framer-motion";
import { C, headingFont, bodyFont } from "./constants";
import { RenderContent } from "@/lib/html-render";
import { Particles } from "./particles";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { track, trackSectionView } from "@/lib/analytics";

export function ContactSection() {
  const { data } = useCmsData();
  const { contact, navbar } = data;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formState, setFormState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "", // Honeypot antispam
  });
  const [formInitTime] = useState<number>(() => Date.now());

  if (isInView) {
    trackSectionView("contato");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          _ts: formInitTime,
        }),
      });

      if (res.ok) {
        setFormState("success");
        track("contact_form_success", {});
        track("contact_form_submitted", { has_message: !!formData.message });
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setFormState("error");
        track("contact_form_error", { error: "HTTP error" });
      }
    } catch {
      setFormState("error");
      track("contact_form_error", { error: "Network error" });
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? formatPhone(value) : value,
    }));

    if (formState === "idle") {
      track("contact_form_started", {});
    }
  };

  return (
    <section
      ref={ref}
      id="contato"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: C.primary, color: C.white }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(223,130,60,0.06) 0%, transparent 60%),
            linear-gradient(180deg, #19396C 0%, #1E4680 100%)
          `,
        }}
      />

      <Particles count={10} />

      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ backgroundColor: "rgba(223,130,60,0.2)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="h-[2px] w-16"
                style={{ backgroundColor: C.accent }}
              />
              <span
                className="text-[13px] uppercase tracking-[0.25em] font-semibold"
                style={{ ...bodyFont, color: C.accent }}
              >
                {contact.eyebrow}
              </span>
            </div>

            <h2
              className="text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight font-bold"
              style={{ ...headingFont, color: C.white }}
            >
              <RenderContent content={contact.titleHtml} />
              <br />
              <span style={{ color: C.accent }}>Suas conversas também.</span>
            </h2>

            <p
              className="text-lg mb-10 leading-relaxed max-w-md"
              style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}
            >
              {contact.description}
            </p>

            <div className="space-y-4">
              {contact.features.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                >
                  <div
                    className="w-5 h-5 border flex items-center justify-center shrink-0"
                    style={{ borderColor: C.accent }}
                  >
                    <div
                      className="w-2 h-2"
                      style={{ backgroundColor: C.accent }}
                    />
                  </div>
                  <span
                    className="text-sm"
                    style={{ ...bodyFont, color: "rgba(255,255,255,0.7)" }}
                  >
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-10 flex items-center gap-3 pt-8 border-t"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/images/gislaine/logo-icon-only.webp" />
              </div>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ ...bodyFont, color: C.white }}
                >
                  {contact.guaranteeTitle}
                </p>
                <p
                  className="text-[10px]"
                  style={{ ...bodyFont, color: "rgba(255,255,255,0.3)" }}
                >
                  {contact.guaranteeDescription}
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div
              className="relative p-8 lg:p-10 border"
              style={{
                borderColor: "rgba(223,130,60,0.15)",
                backgroundColor: "rgba(30,70,128,0.3)",
              }}
            >
              <div
                className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2"
                style={{ borderColor: C.accent }}
              />
              <div
                className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2"
                style={{ borderColor: C.accent }}
              />

              {formState === "success" ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle
                    size={48}
                    className="mx-auto mb-4"
                    style={{ color: C.accent }}
                  />
                  <h3
                    className="text-2xl mb-2"
                    style={{ ...headingFont, color: C.white }}
                  >
                    Mensagem enviada!
                  </h3>
                  <p
                    className="text-sm"
                    style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}
                  >
                    Entrarei em contato em breve.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3
                    className="text-2xl mb-6"
                    style={{ ...headingFont, color: C.white }}
                  >
                    Agende sua sessão
                  </h3>

                  {/* Honeypot invisível para captura de robôs / spam bots */}
                  <div style={{ display: "none", opacity: 0, position: "absolute", left: "-9999px" }} aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] uppercase tracking-[0.15em] mb-2"
                      style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border py-3 px-4 text-sm transition-colors focus:outline-none"
                      style={{
                        ...bodyFont,
                        borderColor: "rgba(255,255,255,0.1)",
                        color: C.white,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] uppercase tracking-[0.15em] mb-2"
                      style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}
                    >
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border py-3 px-4 text-sm transition-colors focus:outline-none"
                      style={{
                        ...bodyFont,
                        borderColor: "rgba(255,255,255,0.1)",
                        color: C.white,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] uppercase tracking-[0.15em] mb-2"
                      style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}
                    >
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border py-3 px-4 text-sm transition-colors focus:outline-none"
                      style={{
                        ...bodyFont,
                        borderColor: "rgba(255,255,255,0.1)",
                        color: C.white,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] uppercase tracking-[0.15em] mb-2"
                      style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}
                    >
                      Mensagem
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-transparent border py-3 px-4 text-sm transition-colors focus:outline-none resize-none"
                      style={{
                        ...bodyFont,
                        borderColor: "rgba(255,255,255,0.1)",
                        color: C.white,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                      placeholder="Conte-me sobre seu desafio..."
                    />
                  </div>

                  {formState === "error" && (
                    <p className="text-xs" style={{ color: "#E57373" }}>
                      Ocorreu um erro. Tente novamente.
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={formState === "loading"}
                    className="w-full flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] py-4 px-8 border transition-all duration-500 cursor-pointer"
                    style={{
                      ...headingFont,
                      backgroundColor: C.cta,
                      borderColor: C.cta,
                      color: C.white,
                    }}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 0 30px rgba(223,130,60,0.3)",
                    }}
                    whileTap={{ scale: 0.99 }}
                    onMouseEnter={(e) => {
                      if (formState !== "loading") {
                        e.currentTarget.style.backgroundColor = C.white;
                        e.currentTarget.style.borderColor = C.white;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = C.cta;
                      e.currentTarget.style.borderColor = C.cta;
                    }}
                  >
                    {formState === "loading" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        {contact.submitButtonText}
                        <Send size={14} />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
