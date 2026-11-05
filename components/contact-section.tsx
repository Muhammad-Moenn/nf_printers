"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

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
    {
      icon: MapPin,
      label: t("visit_label"),
      value: "5FR7+973, Mohalla Faridabad, Multan, Pakistan",
      href: "https://www.google.com/maps/search/?api=1&query=Naseer+Falak+Sher+Printing+Press+Multan",
      external: true,
    },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden py-[var(--space-12)] scroll-mt-24 sm:py-[var(--space-16)]"
    >
      <div className="relative mx-auto max-w-7xl px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            {...reveal()}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center gap-[var(--space-2)] rounded-full!",
                "border-primary-border/70 bg-primary-soft px-[var(--space-3)] py-[var(--space-1)]",
                "text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.18em]",
                "text-primary-text shadow-[var(--shadow-sm)]",
                "[&>svg]:size-[var(--space-4)]",
              )}
            >
              <Mail aria-hidden="true" />
              {t("contact_label")}
            </Badge>

            <h2
              id="contact-heading"
              className="mt-[var(--space-4)] text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl lg:text-4xl xl:text-5xl"
            >
              {highlightLastWord(t("contact_title"))}
            </h2>

            <p className="mx-auto mt-[var(--space-3)] max-w-2xl text-[length:var(--font-size-sm)] leading-6 text-foreground/80 sm:text-[length:var(--font-size-base)] sm:leading-7 dark:text-muted-foreground">
              {t("contact_description")}
            </p>
          </motion.div>

          <div className="mx-auto mt-[var(--space-8)] grid max-w-6xl gap-[var(--space-5)] sm:mt-[var(--space-10)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-[var(--space-6)]">
            <motion.div
              {...reveal(0.05)}
              className="flex min-w-0 flex-col gap-[var(--space-5)]"
            >
              <Card
                className={cn(
                  "gap-0 overflow-hidden rounded-[var(--radius-2xl)]! border-primary-border/70 p-0",
                  "bg-gradient-to-br from-primary to-primary-hover text-on-color",
                  "shadow-[var(--shadow-md)]!",
                  "dark:border-on-color/10 dark:from-card dark:via-card dark:to-[var(--neutral-800)]",
                )}
              >
                <CardHeader className="flex flex-row items-center gap-[var(--space-3)] px-[var(--space-6)] pb-0 pt-[var(--space-6)]">
                  <span className="flex h-[var(--space-10)] w-[var(--space-10)] shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-on-color/10 text-on-color">
                    <Building2
                      className="h-[var(--space-5)] w-[var(--space-5)]"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[length:var(--font-size-caption)] font-semibold uppercase tracking-[0.18em] text-on-color/70">
                      {t("press_name")}
                    </p>
                    <CardTitle
                      role="heading"
                      aria-level={3}
                      className="mt-[var(--space-1)] text-[length:var(--font-size-xl)] font-bold leading-tight text-on-color"
                    >
                      {t("press_heading")}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-[var(--space-6)]">
                  <ul role="list" className="space-y-[var(--space-2)]">
                    {contactItems.map(
                      ({ icon: Icon, label, value, href, external }) => (
                        <li key={label}>
                          <a
                            href={href}
                            target={external ? "_blank" : undefined}
                            rel={external ? "noreferrer" : undefined}
                            className={cn(
                              "group flex items-start gap-[var(--space-3)] rounded-[var(--radius-lg)]",
                              "px-[var(--space-2)] py-[var(--space-2)] outline-none transition-colors duration-300",
                              "hover:bg-on-color/10 focus-visible:ring-2 focus-visible:ring-on-color/60 focus-visible:ring-inset",
                              "motion-reduce:transition-none",
                            )}
                          >
                            <span className="flex h-[var(--space-10)] w-[var(--space-10)] shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-on-color/10 text-on-color transition-colors duration-300 group-hover:bg-on-color/20 motion-reduce:transition-none">
                              <Icon
                                className="h-[var(--space-5)] w-[var(--space-5)]"
                                aria-hidden="true"
                              />
                            </span>

                            <div className="min-w-0">
                              <p className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.14em] text-on-color/70">
                                {label}
                              </p>
                              <p
                                dir="auto"
                                className="mt-[var(--space-1)] break-words text-[length:var(--font-size-sm)] font-medium leading-6 text-on-color"
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

              <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-card shadow-[var(--shadow-sm)] dark:border-on-color/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55177.89415736618!2d71.38694674863284!3d30.19089330000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b31006374b679%3A0x2dfb13d09ac31558!2sNaseer%20Falak%20Sher%20Printing%20Press!5e0!3m2!1sen!2s!4v1773399326480!5m2!1sen!2s"
                  className="aspect-[16/10] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t("map_title")}
                />
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
                <CardHeader className="flex flex-row items-center gap-[var(--space-3)] px-[var(--space-6)] pb-0 pt-[var(--space-6)]">
                  <span className="flex h-[var(--space-10)] w-[var(--space-10)] shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
                    <Send
                      className="h-[var(--space-5)] w-[var(--space-5)]"
                      aria-hidden="true"
                    />
                  </span>
                  <CardTitle
                    role="heading"
                    aria-level={3}
                    className="text-[length:var(--font-size-xl)] font-bold leading-tight text-heading"
                  >
                    {t("contact_cta")}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-[var(--space-6)]">
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
                          className="h-[calc(var(--space-10)+var(--space-1))] text-[length:var(--font-size-sm)]"
                        />
                      </div>

                      <div className="space-y-[var(--space-2)]">
                        <Label
                          htmlFor="contact-email"
                          className="text-[length:var(--font-size-sm)] font-semibold text-heading"
                        >
                          {t("email_form_label")}
                        </Label>
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
                          className="h-[calc(var(--space-10)+var(--space-1))] text-[length:var(--font-size-sm)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-[var(--space-2)]">
                      <Label
                        htmlFor="contact-subject"
                        className="text-[length:var(--font-size-sm)] font-semibold text-heading"
                      >
                        {t("subject_label")}
                      </Label>
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
                        className="h-[calc(var(--space-10)+var(--space-1))] text-[length:var(--font-size-sm)]"
                      />
                    </div>

                    <div className="space-y-[var(--space-2)]">
                      <Label
                        htmlFor="contact-message"
                        className="text-[length:var(--font-size-sm)] font-semibold text-heading"
                      >
                        {t("message_label")}
                      </Label>
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
                        className="min-h-[calc(var(--space-16)*2.5)] resize-none text-[length:var(--font-size-sm)]"
                      />
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
                        "group h-[var(--space-12)] w-full rounded-full!",
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
