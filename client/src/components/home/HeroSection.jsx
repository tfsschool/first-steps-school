import React from 'react';
import { FaUniversity, FaGraduationCap, FaFutbol, FaUsers } from 'react-icons/fa';

const HeroSection = () => {
  const heroImage =
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2400&q=80';

  const items = [
    { label: 'University Life', Icon: FaUniversity },
    { label: 'Graduation', Icon: FaGraduationCap },
    { label: 'Athletics', Icon: FaFutbol },
    { label: 'Social', Icon: FaUsers },
  ];

  return (
    <section className="relative">
      <div
        className="h-[600px] bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
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

      <div className="absolute left-1/2 -translate-x-1/2 bottom-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Slide 1"
            className="w-4 h-4 rounded-full bg-white/35 hover:bg-white/60 transition-colors"
          />
          <button
            type="button"
            aria-label="Slide 2"
            className="w-4 h-4 rounded-full border-2 border-white bg-transparent"
          />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="-mt-16 bg-white rounded-lg shadow-[0_18px_45px_-30px_rgba(0,0,0,0.55)] border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {items.map(({ label, Icon }) => (
              <div
                key={label}
                className="group p-7 flex items-center gap-4 justify-center md:justify-start hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                  <Icon className="text-theme-blue text-2xl group-hover:text-theme-green transition-colors duration-200" />
                </div>
                <div className="font-semibold text-gray-800">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
