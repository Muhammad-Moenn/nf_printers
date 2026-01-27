export default function ServicesHero() {
  return (
    <section className="relative h-[76vh] md:h-[90vh] w-full overflow-hidden -mt-1">
      {/* Background Video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos\services-hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl text-center font-semibold  text-white md:text-6xl leading-tighter">
              Professional Printing & Digital Services
            </h1>

            <p className="mt-6 text-lg text-gray-200 md:text-lg text-center">
              From high-quality printing to custom branding solutions, we help
              businesses stand out with precision, speed, and reliability.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
