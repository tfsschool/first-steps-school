import React, { useMemo, useState } from 'react';

const HeroSection = () => {
  const slides = useMemo(
    () => [
      {
        image:
          'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2400&q=80',
      },
      {
        image:
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2400&q=80',
      },
    ],
    []
  );

  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="relative">
      <div
        className="h-[600px] bg-cover bg-center transition-opacity"
        style={{ backgroundImage: `url(${slides[activeSlide]?.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-theme-blue/80 via-theme-blue/55 to-theme-blue/25" />

        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white">
              <div className="text-white/90 text-lg md:text-xl font-medium">
                The First Steps School
              </div>
              <h1 className="mt-3 text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
                Empowering Young Minds
              </h1>
              <div className="mt-8">
                <button
                  type="button"
                  className="inline-flex items-center justify-center bg-white text-theme-blue px-6 py-3 font-semibold tracking-wide shadow-sm hover:bg-theme-green hover:text-white transition-colors duration-200"
                >
                  Take a Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-20">
        <div className="flex items-center gap-3">
          {slides.map((_, index) => {
            const isActive = index === activeSlide;
            return (
              <button
                key={index}
                type="button"
                aria-label={`Slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={
                  isActive
                    ? 'relative w-5 h-5 rounded-full border-2 border-white bg-transparent'
                    : 'w-4 h-4 rounded-full bg-white/45 hover:bg-white/70 transition-colors'
                }
              >
                {isActive ? (
                  <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                ) : null}
                <span className="sr-only">{`Go to slide ${index + 1}`}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
