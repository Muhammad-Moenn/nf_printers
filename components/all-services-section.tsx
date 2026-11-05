import { services } from '@/data/services'
import { ServiceCard } from './service-card'
import Link from 'next/link'
import clsx from 'clsx'
import { prisma } from '@/lib/prisma'

async function AllServicesSection({className=""}: { className?: string }) {
  let catalog = services;
  try {
    const records = await prisma.service.findMany({ where: { isActive: true }, orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] });
    if (records.length) {
      catalog = records.map((service) => ({
        id: service.id,
        title: service.name,
        description: service.description,
        icon: service.icon,
        iconColor: 'text-primary-text',
        iconBg: 'bg-primary/10',
        details: service.details ?? undefined,
        link: `/services/${service.slug}`,
        slug: service.slug,
      }));
    }
  } catch (error) {
    console.error('Unable to load service catalog; showing built-in services.', error);
  }

  return (
     <section   className={clsx(
        'py-30 xl:py-40 bg-card dark:bg-neutral-950',
        className
      )}>
           <div className="max-w-7xl mx-auto px-6">
             {/* Header */}
             <div className="text-center mb-14">
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground dark:text-on-color">
                 Our Printing Services
               </h2>
               <p className="mt-5 text-muted-foreground dark:text-neutral-300 max-w-2xl text-lg mx-auto">
                 We provide reliable and professional printing solutions for
                 individuals, businesses, and institutions.
               </p>
             </div>
     
             {/* Slider */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4">
               {catalog.map((service) => (
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
