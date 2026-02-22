import ActionBanner from "@/components/action-banner";
import AllServicesSection from "@/components/all-services-section";
import FAQSection from "@/components/faqs-section";
import ServicesHero from "@/components/services-hero";
import { FileText } from "lucide-react";

export default function page() {
  return (
   <div >
     <ServicesHero/>
     <AllServicesSection/>
     <FAQSection/>
      <ActionBanner
      // heading="Need Professional Printing Services?"
      // description="High-quality printing for schools, offices, and businesses."
      // primaryText="Order Now"
      // primaryHref="/order"
      // showSecondary={false}
    />
   </div>
  )
}
