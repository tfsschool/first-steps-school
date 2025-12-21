import React from 'react';
import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import AdmissionSection from '../components/home/AdmissionSection';
import FeaturesStrip from '../components/home/FeaturesStrip';
import { FaPlay } from 'react-icons/fa';

const Home = () => {
  return (
    <>
      <SEO 
        title="Home" 
        description="Empowering young minds to take their first steps towards a bright future. The First Steps School is dedicated to providing quality education and nurturing the potential of every student."
        canonicalUrl="/"
      />
      <div className="min-h-screen">
        <HeroSection />
        <AdmissionSection />
        <FeaturesStrip />

        <section className="bg-gray-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-lg border border-gray-200 bg-white shadow-sm p-10 text-center">
              <div className="text-sm tracking-[0.3em] uppercase text-gray-500">Video Tour</div>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-theme-dark">
                Explore Our Campus
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                A short virtual walkthrough will be available here soon.
              </p>

              <div className="mt-10 flex items-center justify-center">
                <button
                  type="button"
                  className="w-20 h-20 rounded-full bg-theme-blue text-white flex items-center justify-center shadow hover:brightness-95 transition"
                  aria-label="Play video tour"
                >
                  <FaPlay className="text-2xl ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;

