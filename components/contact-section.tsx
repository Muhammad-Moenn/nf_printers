"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Textarea } from "./ui/textarea";

const ContactSection = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  // ✅ Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ✅ Validate fields
  const validateFields = () => {
    const newErrors = {
      name: form.name.trim() === "",
      email: form.email.trim() === "" || !isValidEmail(form.email),
      subject:form.subject.trim() === "",
      message: form.message.trim() === "",
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((val) => !val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Message sent successfully!");

        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });

        setErrors({
          name: false,
          email: false,
          subject: false,
          message: false,
        });

        setTimeout(() => setSuccess(false), 3000);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <section
      id="contact"
      className="bg-gray-50 dark:bg-[#181818] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-amber-500">
            Get In Touch
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Let's Bring Your Ideas to Print
          </h2>
          <p className="mt-3 text-muted-foreground">
            Have a project in mind? Send us a message and we'll get back to you
            promptly.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-5">
          {/* Contact Info */}
          <motion.div
            className="space-y-6 lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="rounded-xl border-2 bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] border-1 border-gray-300/100 dark:border-gray-600/70 shadow-md backdrop-blur-md p-6 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <Phone className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Call Us</p>
                  <p className="text-xs font-medium text-muted-foreground flex flex-col">
                    +92 3045033607 {""} <span>+92 3009774895</span>
                  </p>
                </div>
              </div>
              {[
                // { icon: Phone, label: "Call Us", value: "+92 3009774895" },
                {
                  icon: Mail,
                  label: "Email Us",
                  value: "nfprinter3610@gmail.com",
                },
                // { icon:'', label: '', value: "+92 3009774895" },
                {
                  icon: MapPin,
                  label: "Visit Us",
                  value: "5FR7+973, Mohalla Faridabad, Multan, Pakistan",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <Icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {label}
                    </p>
                    <p className="text-sm text-muted-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl border bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] border-1 border-gray-300/100 dark:border-gray-600/70 shadow-md backdrop-blur-md "
            >
              <div className="w-full h-[200px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55177.89415736618!2d71.38694674863284!3d30.19089330000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b31006374b679%3A0x2dfb13d09ac31558!2sNaseer%20Falak%20Sher%20Printing%20Press!5e0!3m2!1sen!2s!4v1773399326480!5m2!1sen!2s"
                  className="w-full h-full rounded-xl"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              {/* <p className="font-heading font-semibold text-foreground">
                Business Hours
              </p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>Mon – Fri: 9:00 AM – 6:00 PM</p>
                <p>Saturday: 10:00 AM – 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div> */}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e as any);
              }
            }}
            className="space-y-5 rounded-xl border-2 bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] border-1 border-gray-300/100 dark:border-gray-600/70 shadow-md backdrop-blur-md p-6 lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Name *
                </label>
                <Input
                  className={`${
                    errors.name
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, name: value });

                    setErrors((prev) => ({
                      ...prev,
                      name: value.trim() === "",
                    }));
                  }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  className={`${
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, email: value });

                    setErrors((prev) => ({
                      ...prev,
                      email: value.trim() === "" || !isValidEmail(value),
                    }));
                  }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Subject
              </label>
              <Input
              className={`${
                    errors.subject
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                placeholder="What's this about?"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Message *
              </label>
              <Textarea
                placeholder="Tell us about your project..."
                value={form.message}
                className={`min-h-[140px] ${
                  errors.message
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, message: value });

                  setErrors((prev) => ({
                    ...prev,
                    message: value.trim() === "",
                  }));
                }}
              />
            </div>
            <Button
              disabled={loading}
              type="submit"
              size="lg"
              className="w-full gap-2 bg-[#F97316] hover:dark:bg-[#EA580C]  cursor-pointer mt-4 hover:-translate-y-0.5 transition duration-200  text-center  mx-auto flex justify-center items-center  "
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear",
                  }}
                />
              ) : success ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  ✅ Sent
                </motion.span>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Message
                </>
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
