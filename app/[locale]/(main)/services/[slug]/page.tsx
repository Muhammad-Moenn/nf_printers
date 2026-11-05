import { Button } from "@/components/ui/button";
import { services } from "@/data/services";
import { MoveRight } from "lucide-react";


async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // ✅ await the params
    const service= services.find(s => s.id === Number(slug));
    if (!service) {
      return <div>Service not found</div>;
    }
      const { title, description, details, features, options, idealFor, icon: Icon, iconColor, iconBg, link } = service;
  return (
   <div className="min-h-screen bg-surface-2 dark:bg-neutral-950 text-foreground dark:text-neutral-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-violet dark:from-primary dark:to-violet text-on-color py-24 px-6 md:px-12 rounded-b-3xl">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-flex p-6 rounded-full ${iconBg}  mb-4`}>
            <Icon className={`w-12 h-12 ${iconColor}`} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg md:text-xl opacity-90">{description}</p>
        </div>
      </section>

      {/* Details Section */}
      <section className="max-w-6xl mx-auto py-16 px-6 md:px-12">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold mb-4">About This Service</h2>
          <p className="text-foreground dark:text-neutral-300 leading-relaxed">{details}</p>
        </div>

        {/* Features and Options */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Features</h3>
            <ul className="list-disc list-inside text-foreground dark:text-neutral-300 space-y-2">
              {features?.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-4">Options & Ideal For</h3>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Options:</h4>
              <ul className="list-disc list-inside text-foreground dark:text-neutral-300 space-y-1">
                {options?.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Ideal For:</h4>
              <div className="flex flex-wrap gap-2">
                {idealFor?.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-primary-soft dark:bg-primary text-primary-text dark:text-neutral-100 text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Button
          
            className=" px-8 py-5 bg-primary text-on-color font-medium rounded-lg shadow-lg hover:bg-primary dark:bg-primary dark:hover:bg-primary  flex justify-center items-center mx-auto text-[16px] hover:-translate-y-0.5 transition-all duration-300  group min-w-[150px]"
          >
            Get Started
             <MoveRight className="w-4 h-4 ml-1 transition-transform duration-500 group-hover:translate-x-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}

export default ServiceDetail;
