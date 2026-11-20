"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Printer,
  Send,
  Tag,
  UserRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { submitContactRequest } from "@/lib/data/contact";

import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Record<keyof FormState, boolean>;

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const initialErrors: FormErrors = {
  name: false,
  email: false,
  subject: false,
  message: false,
};

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=Naseer+Falak+Sher+Printing+Press+Multan";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ContactSection = () => {
  const locale = useLocale();
  const t = useTranslations("home.landing");
  const isRTL = locale === "ur";
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const reduceMotion = hasMounted && Boolean(prefersReducedMotion);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const hasErrors = Object.values(errors).some(Boolean);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: reduceMotion
      ? { duration: 0 }
      : {
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1] as const,
        },
  });

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]:
        field === "email"
          ? value.trim() === "" || !isValidEmail(value)
          : value.trim() === "",
    }));
  };

  const validateFields = () => {
    const nextErrors: FormErrors = {
      name: form.name.trim() === "",
      email: form.email.trim() === "" || !isValidEmail(form.email),
      subject: form.subject.trim() === "",
      message: form.message.trim() === "",
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateFields()) {
      toast.error(t("form_error"));
      return;
    }

    setLoading(true);

    try {
      const data = await submitContactRequest(form);

      if (data.success) {
        setSuccess(true);
        toast.success(t("form_success"));
        setForm(initialForm);
        setErrors(initialErrors);
        window.setTimeout(() => setSuccess(false), 3000);
      } else {
        toast.error(t("form_failed"));
      }
    } catch {
      toast.error(t("form_unknown"));
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    {
      icon: MapPin,
      label: t("visit_label"),
      value: "5FR7+973, Mohalla Faridabad, Multan, Pakistan",
      href: mapUrl,
      external: true,
    },
    {
      icon: Phone,
      label: t("call_label"),
      value: "+92 304 5033707 / +92 300 9774895",
      href: "tel:+923045033707",
      external: false,
    },
    {
      icon: Mail,
      label: t("email_label"),
      value: "nfprinter3610@gmail.com",
      href: "mailto:nfprinter3610@gmail.com",
      external: false,
    },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden py-[var(--space-8)] scroll-mt-24 sm:py-[var(--space-10)] lg:py-[var(--space-12)]"
    >
      <div className="relative mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <div className="relative mx-auto max-w-7xl">
          <motion.div {...reveal()} className="mx-auto max-w-3xl text-center">
            <span className="landing-eyebrow">
              <Mail aria-hidden="true" className="size-4 shrink-0" />
              {t("contact_label")}
            </span>

            <h2
              id="contact-heading"
              className="landing-section-title mt-[var(--space-4)]"
            >
              {highlightLastWord(
                t("contact_title"),
                "landing-section-title-highlight",
              )}
            </h2>

            <p className="landing-section-description mx-auto mt-[var(--space-3)]">
              {t("contact_description")}
            </p>
            <div
              aria-hidden="true"
              className="mt-[var(--space-3)] flex items-center justify-center gap-4 text-primary sm:mt-[var(--space-4)]"
            >
              <span className="h-0.5 w-16 rounded-full bg-primary-border sm:w-20" />
              <Printer className="size-6" strokeWidth={2.2} />
              <span className="h-0.5 w-16 rounded-full bg-primary-border sm:w-20" />
            </div>
          </motion.div>

          <div className="mx-auto mt-[var(--space-5)] grid max-w-7xl items-stretch gap-[var(--space-4)] sm:mt-[var(--space-6)] sm:gap-[var(--space-5)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-[var(--space-6)]">
            <motion.div
              {...reveal(0.05)}
              className="flex min-w-0 flex-col gap-[var(--space-5)]"
            >
              <Card
                className={cn(
                  "relative isolate gap-0 overflow-hidden rounded-[var(--radius-3xl)]! border-primary-border/70 p-0",
                  "bg-[var(--landing-footer)] text-on-color",
                  "shadow-[var(--shadow-md)]!",
                )}
              >
                <Image
                  src="/machine-image.png"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 1023px) 92vw, 42vw"
                  className="pointer-events-none -z-10 object-contain object-right-bottom opacity-20"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[var(--landing-footer)] via-[var(--landing-footer)]/90 to-primary/55"
                />

                <CardHeader
                  className={cn(
                    "block px-[var(--space-5)] pb-0 pt-[var(--space-5)] sm:px-[var(--space-6)] sm:pt-[var(--space-6)]",
                    isRTL && "text-end",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="mb-[var(--space-2)] block h-1 w-20 rounded-full bg-primary"
                  />
                  <CardTitle
                    role="heading"
                    aria-level={3}
                    className="font-hero text-3xl font-semibold leading-tight tracking-tight text-on-color sm:text-4xl"
                  >
                    {t("contact_card_title")}{" "}
                    <span className="text-landing-sky dark:text-primary-soft-foreground">
                      {t("contact_card_highlight")}
                    </span>
                  </CardTitle>
                  <p className="mt-[var(--space-2)] max-w-lg font-hero text-sm leading-relaxed text-on-color/90 sm:text-base">
                    {t("contact_card_description")}
                  </p>
                </CardHeader>

                <CardContent className="relative z-10 p-[var(--space-4)] sm:p-[var(--space-5)]">
                  <ul
                    role="list"
                    className="space-y-[var(--space-2)] sm:space-y-[var(--space-3)]"
                  >
                    {contactItems.map(
                      ({ icon: Icon, label, value, href, external }) => (
                        <li key={label}>
                          <a
                            href={href}
                            target={external ? "_blank" : undefined}
                            rel={external ? "noreferrer" : undefined}
                            className={cn(
                              "group flex items-start gap-[var(--space-3)] rounded-[var(--radius-lg)]",
                              "px-[var(--space-2)] py-[var(--space-2)] text-start outline-none transition-colors duration-300",
                              "hover:bg-on-color/10 focus-visible:ring-2 focus-visible:ring-on-color/60 focus-visible:ring-inset",
                              "motion-reduce:transition-none",
                            )}
                          >
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-md)] transition-colors duration-300 group-hover:bg-primary-hover motion-reduce:transition-none">
                              <Icon
                                className="h-[var(--space-5)] w-[var(--space-5)]"
                                aria-hidden="true"
                              />
                            </span>

                            <span
                              aria-hidden="true"
                              className="mt-0.5 hidden h-11 w-0.5 shrink-0 rounded-full bg-primary sm:block"
                            />
                            <div className="min-w-0">
                              <p className="font-hero text-sm font-semibold text-on-color">
                                {label}
                              </p>
                              <p
                                dir="auto"
                                className="mt-[var(--space-1)] break-words font-hero text-sm font-medium leading-snug text-on-color/90 sm:text-sm"
                              >
                                {value}
                              </p>
                            </div>
                          </a>
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>

              <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-primary-border/70 bg-card shadow-[var(--shadow-md)]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55177.89415736618!2d71.38694674863284!3d30.19089330000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b31006374b679%3A0x2dfb13d09ac31558!2sNaseer%20Falak%20Sher%20Printing%20Press!5e0!3m2!1sen!2s!4v1773399326480!5m2!1sen!2s"
                  className="aspect-[16/9] w-full border-0 sm:aspect-[16/7]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t("map_title")}
                />
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "absolute start-3 top-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-border/70 bg-card/95 px-4 font-hero text-sm font-semibold text-heading shadow-[var(--shadow-md)] backdrop-blur-sm transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                  {t("open_maps")}
                  <ArrowUpRight
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </motion.div>

            <motion.div {...reveal(0.1)} className="min-w-0">
              <Card
                className={cn(
                  "gap-0 overflow-hidden rounded-[var(--radius-2xl)]! border-primary-border/60 p-0",
                  "bg-card shadow-[var(--shadow-md)]!",
                  "dark:border-on-color/10",
                )}
              >
                <CardHeader className="flex flex-row items-start gap-[var(--space-4)] px-[var(--space-5)] pb-0 pt-[var(--space-5)] sm:px-[var(--space-6)] sm:pt-[var(--space-6)]">
                  <span className="flex h-[var(--space-10)] w-[var(--space-10)] shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
                    <Send
                      className="h-[var(--space-5)] w-[var(--space-5)]"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0">
                    <CardTitle
                      role="heading"
                      aria-level={3}
                      className="font-hero text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl"
                    >
                      {highlightLastWord(t("contact_cta"))}
                    </CardTitle>
                    <p className="mt-[var(--space-2)] font-hero text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {t("contact_form_description")}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-[var(--space-4)] sm:p-[var(--space-6)]">
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-[var(--space-5)]"
                  >
                    <div className="grid gap-[var(--space-5)] sm:grid-cols-2">
                      <div className="space-y-[var(--space-2)]">
                        <Label
                          htmlFor="contact-name"
                          className="text-[length:var(--font-size-sm)] font-semibold text-heading"
                        >
                          {t("name_label")}
                        </Label>
                        <div className="relative">
                          <UserRound
                            aria-hidden="true"
                            className="pointer-events-none absolute start-4 top-1/2 z-10 size-5 -translate-y-1/2 text-primary"
                          />
                          <Input
                            id="contact-name"
                            name="name"
                            autoComplete="name"
                            required
                            disabled={loading}
                            value={form.name}
                            onChange={(event) =>
                              updateField("name", event.target.value)
                            }
                            aria-invalid={errors.name}
                            placeholder={t("name_placeholder")}
                            className="h-[calc(var(--space-10)+var(--space-1))] rounded-[var(--radius-xl)] border-primary-border/60 bg-background/70 ps-11 text-[length:var(--font-size-sm)] focus-visible:ring-primary/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-[var(--space-2)]">
                        <Label
                          htmlFor="contact-email"
                          className="text-[length:var(--font-size-sm)] font-semibold text-heading"
                        >
                          {t("email_form_label")}
                        </Label>
                        <div className="relative">
                          <Mail
                            aria-hidden="true"
                            className="pointer-events-none absolute start-4 top-1/2 z-10 size-5 -translate-y-1/2 text-primary"
                          />
                          <Input
                            id="contact-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            disabled={loading}
                            value={form.email}
                            onChange={(event) =>
                              updateField("email", event.target.value)
                            }
                            aria-invalid={errors.email}
                            placeholder={t("email_placeholder")}
                            className="h-[calc(var(--space-10)+var(--space-1))] rounded-[var(--radius-xl)] border-primary-border/60 bg-background/70 ps-11 text-[length:var(--font-size-sm)] focus-visible:ring-primary/30"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-[var(--space-2)]">
                      <Label
                        htmlFor="contact-subject"
                        className="text-[length:var(--font-size-sm)] font-semibold text-heading"
                      >
                        {t("subject_label")}
                      </Label>
                      <div className="relative">
                        <Tag
                          aria-hidden="true"
                          className="pointer-events-none absolute start-4 top-1/2 z-10 size-5 -translate-y-1/2 text-primary"
                        />
                        <Input
                          id="contact-subject"
                          name="subject"
                          required
                          disabled={loading}
                          value={form.subject}
                          onChange={(event) =>
                            updateField("subject", event.target.value)
                          }
                          aria-invalid={errors.subject}
                          placeholder={t("subject_placeholder")}
                          className="h-[calc(var(--space-10)+var(--space-1))] rounded-[var(--radius-xl)] border-primary-border/60 bg-background/70 ps-11 text-[length:var(--font-size-sm)] focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-[var(--space-2)]">
                      <Label
                        htmlFor="contact-message"
                        className="text-[length:var(--font-size-sm)] font-semibold text-heading"
                      >
                        {t("message_label")}
                      </Label>
                      <div className="relative">
                        <MessageSquareText
                          aria-hidden="true"
                          className="pointer-events-none absolute start-4 top-4 z-10 size-5 text-primary"
                        />
                        <Textarea
                          id="contact-message"
                          name="message"
                          required
                          disabled={loading}
                          value={form.message}
                          onChange={(event) =>
                            updateField("message", event.target.value)
                          }
                          aria-invalid={errors.message}
                          placeholder={t("message_placeholder")}
                          className="min-h-[calc(var(--space-16)*2.5)] resize-y rounded-[var(--radius-xl)] border-primary-border/60 bg-background/70 ps-11 pt-3 text-[length:var(--font-size-sm)] focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>

                    {hasErrors ? (
                      <p
                        role="alert"
                        className="flex items-start gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-destructive-border bg-destructive-soft px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-xs)] font-medium leading-5 text-destructive-text"
                      >
                        <AlertCircle
                          className="mt-0.5 h-[var(--space-4)] w-[var(--space-4)] shrink-0"
                          aria-hidden="true"
                        />
                        {t("form_error")}
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      aria-busy={loading}
                      className={cn(
                        "group h-14 w-full rounded-full! sm:h-16",
                        "bg-gradient-to-r from-primary to-primary-hover font-semibold text-on-color",
                        "shadow-[var(--shadow-md)] transition-all duration-300",
                        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
                        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                        "disabled:opacity-70",
                      )}
                    >
                      {loading ? (
                        <>
                          <Loader2
                            className="h-[var(--space-4)] w-[var(--space-4)] animate-spin motion-reduce:animate-none"
                            aria-hidden="true"
                          />
                          {t("send_message")}
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle2
                            className="h-[var(--space-4)] w-[var(--space-4)]"
                            aria-hidden="true"
                          />
                          {t("sent_label")}
                        </>
                      ) : (
                        <>
                          <Send
                            className="h-[var(--space-4)] w-[var(--space-4)]"
                            aria-hidden="true"
                          />
                          {t("send_message")}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
