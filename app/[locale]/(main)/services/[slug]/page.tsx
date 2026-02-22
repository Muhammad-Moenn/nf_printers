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
   <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white py-24 px-6 md:px-12 rounded-b-3xl">
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
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{details}</p>
        </div>

        {/* Features and Options */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Features</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              {features?.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-4">Options & Ideal For</h3>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Options:</h4>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                {options?.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Ideal For:</h4>
              <div className="flex flex-wrap gap-2">
                {idealFor?.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500 text-blue-800 dark:text-gray-100 text-sm font-medium">
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
          
            className=" px-8 py-5 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700  flex justify-center items-center mx-auto text-[16px] hover:-translate-y-0.5 transition-all duration-300  group min-w-[150px]"
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
