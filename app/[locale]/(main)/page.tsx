import { GetDBUser } from '@/app/actions/user_action';
import { redirect } from 'next/navigation';
import { HeroSection } from "@/components/ui/Hero";
import { Spotlight } from "@/components/ui/spotlight";
import Testimonials from '@/components/testimonial';
import BrandSlider from "@/components/BrandSlider";
import { ServicesSection } from "@/components/services-section";
import ActionBanner from "@/components/action-banner";
import About from "@/components/about";
import FAQSection from "@/components/faqs-section";
import { setRequestLocale } from "next-intl/server";
import ContactSection from '@/components/contact-section';
import Testimonials2Section from '@/components/testimonial2-section';
import StatsSection from '@/components/stats-section';


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
    <div className="w-full overflow-x-hidden ">
      <HeroSection/>
      <StatsSection/>
      <BrandSlider/>
      <Spotlight
        className="-top-40 right-0 md:-top-20 md:right-0  absolute"
      />
      <About/>
      {/* <EmployeeSection/> */}
      <ServicesSection/>
      {/* <Testimonials/> */}
      <Testimonials2Section/>
      <FAQSection/>
      < ContactSection/>
      <ActionBanner/>
    </div>
  );
}
