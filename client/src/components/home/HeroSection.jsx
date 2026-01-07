
import React, { useMemo, useState } from 'react';
import './HomeStyles.css';
const HeroSection = () => {
  const slides = useMemo(
    () => [
      {
        image: '/82283529_3330051090360567_6299281597917036544_n.jpg',
      },
      {
        image: '/IMG_20230415_150701.jpg',
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
              
              <h1 className="mt-3 text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight" style={{ fontFamily: "var(--serif-font, 'Playfair Display', Georgia, serif)" }}>
                The First Steps School
              </h1>
              <div className="mt-4 ml-1 text-white/90 text-lg md:text-xl font-medium tracking-wide">
               Where bright minds and compassionate hearts grow together
              </div>
              <div className="mt-8">
                {/* <button
                  type="button"
                  className="inline-flex items-center justify-center bg-white text-theme-blue px-6 py-3 font-semibold tracking-wide shadow-sm hover:bg-theme-green hover:text-white transition-colors duration-200"
                >
                  Take a Tour
                </button> */}
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
