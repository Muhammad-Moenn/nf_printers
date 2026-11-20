import ActionBanner from "@/components/action-banner";
import AllServicesSection from "@/components/all-services-section";
import FAQSection from "@/components/faqs-section";
import PrintProcessSection from "@/components/print-process-section";
import ServicesHero from "@/components/services-hero";

export default function page() {
  return (
   <div >
     <ServicesHero/>
     <AllServicesSection/>
     <PrintProcessSection/>
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
