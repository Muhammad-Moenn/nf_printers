import { HeroSection } from "@/components/ui/Hero";
import TrustedBySection from "@/components/trusted-by-section";
import { ServicesSection } from "@/components/services-section";
import ActionBanner from "@/components/action-banner";
import About from "@/components/about";
import WhyChooseUsSection from "@/components/why-choose-us-section";
import FAQSection from "@/components/faqs-section";
import { setRequestLocale } from "next-intl/server";
import ContactSection from '@/components/contact-section';
import Testimonials2Section from '@/components/testimonial2-section';
import PrintProcessSection from '@/components/print-process-section';


export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  
  // const dbUser = await GetDBUser();
  // if (!dbUser) {
  //   redirect("/sign-in");
  //   }
  // If user is authenticated, redirect based on role
  // 
  
  // If not authenticated, show the home page
  return (
    <div className=" w-full overflow-x-hidden">
      <HeroSection/>
      <TrustedBySection/>
      <About/>
      <WhyChooseUsSection/>
      <PrintProcessSection/>
      <ServicesSection/>
      <Testimonials2Section/>
      <FAQSection/>
      < ContactSection/>
      <ActionBanner/>
    </div>
  );
}
