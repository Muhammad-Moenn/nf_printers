import { services } from '@/data/services'
import { ServiceCard } from './service-card'
import Link from 'next/link'
import clsx from 'clsx'

function AllServicesSection({className=""}) {

  return (
     <section   className={clsx(
        'py-30 xl:py-40 bg-white dark:bg-black',
        className
      )}>
           <div className="max-w-7xl mx-auto px-6">
             {/* Header */}
             <div className="text-center mb-14">
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-950 dark:text-white">
                 Our Printing Services
               </h2>
               <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl text-lg mx-auto">
                 We provide reliable and professional printing solutions for
                 individuals, businesses, and institutions.
               </p>
             </div>
     
             {/* Slider */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4">
               {services.map((service) => (
                 <Link href={`/user-dashboard/new-order?service=${service.title}`} key={service.id} className="px-3 mt-2">
                   <ServiceCard {...service} />
                 </Link>
               ))}
               </div>
                
             
           </div>
         </section>
  )
}

export default AllServicesSection
