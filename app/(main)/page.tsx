
import { NavBar } from "@/components/header";
import { HeroSection } from "@/components/ui/Hero";
import { Spotlight } from "@/components/ui/spotlight";
import Testimonials from '@/components/testimonial';
import BrandSlider from "@/components/BrandSlider";
import EmployeeSection from "@/components/empolyee-section";
import { Footer } from "@/components/ui/footer";
import { ServicesSection } from "@/components/services-section";
import ActionBanner from "@/components/action-banner";
import About from "@/components/about";
import FAQSection from "@/components/faqs-section";


export default function Home() {
  return (
    <div className="w-full overflow-x-hidden ">
      
      <HeroSection/>
      <BrandSlider/>
      {/* <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60  absolute"
        // fill="white"
        /> */}
      <Spotlight
        className="-top-40 right-0 md:-top-20 md:right-0  absolute"
        // fill="white"
        />
        <About/>
        <EmployeeSection/>
        <ServicesSection/>
        <Testimonials/>
        <FAQSection/>
        <ActionBanner/>
       
    </div>
  );
}
