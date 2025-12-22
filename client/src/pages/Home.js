import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import FeaturesStrip from '../components/home/FeaturesStrip';
import { FaBookOpen, FaChalkboardTeacher, FaFlask, FaPalette } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Home" 
        description="Empowering young minds to take their first steps towards a bright future. The First Steps School is dedicated to providing quality education and nurturing the potential of every student."
        canonicalUrl="/"
      />
      <div className="min-h-screen">
        <HeroSection />
        <FeaturesStrip />

        <section className="relative bg-theme-blue py-16">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2400&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-theme-blue via-theme-blue/90 to-theme-blue/70" />

          <div className="relative container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              <div className="lg:col-span-1">
                <div className="text-white/80 text-xs tracking-[0.35em] uppercase font-semibold">
                  The First Steps School
                </div>
                <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-theme-green">
                  About Our School
                </h2>
              </div>

              <div className="lg:col-span-2">
                <p className="text-white/90 leading-relaxed text-base md:text-lg">
                  We are committed to providing a supportive learning environment for every child — building strong
                  foundations, confidence, and character from <span className="font-semibold">Playgroup</span> to{' '}
                  <span className="font-semibold">Grade 10</span>.
                </p>
                <p className="mt-5 text-white/85 leading-relaxed">
                  Our focus is on strong academics, co-curricular growth, and a safe, caring campus where students feel
                  motivated to achieve.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <div className="text-xs tracking-[0.25em] uppercase text-theme-dark/50 font-semibold">Academics</div>
                <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-theme-dark">Programs & Learning</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/careers')}
                className="text-theme-blue hover:text-theme-green font-semibold transition-colors"
              >
                Join Our Team
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-soft p-7">
                <FaBookOpen className="text-theme-blue text-3xl" />
                <div className="mt-4 font-extrabold text-theme-dark">Primary School</div>
                <div className="mt-2 text-gray-600 text-sm leading-relaxed">
                  Strong foundations in literacy, numeracy, and confidence-building.
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-soft p-7">
                <FaChalkboardTeacher className="text-theme-blue text-3xl" />
                <div className="mt-4 font-extrabold text-theme-dark">Middle School</div>
                <div className="mt-2 text-gray-600 text-sm leading-relaxed">
                  Study habits, critical thinking, and student leadership.
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-soft p-7">
                <FaFlask className="text-theme-blue text-3xl" />
                <div className="mt-4 font-extrabold text-theme-dark">STEM Learning</div>
                <div className="mt-2 text-gray-600 text-sm leading-relaxed">
                  Hands-on activities, experiments, and problem-solving.
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-soft p-7">
                <FaPalette className="text-theme-blue text-3xl" />
                <div className="mt-4 font-extrabold text-theme-dark">Arts & Activities</div>
                <div className="mt-2 text-gray-600 text-sm leading-relaxed">
                  Creativity, confidence, and well-rounded development.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-xs tracking-[0.25em] uppercase text-theme-dark/50 font-semibold">
                  Student Life
                </div>
                <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-theme-dark">Facilities & Safety</h2>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  A campus designed for learning, creativity, and wellbeing — supported by reliable transport and
                  strong safety practices.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <FaChalkboardTeacher className="text-theme-green text-2xl" />
                      <div className="font-bold text-theme-dark">Modern Classrooms</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">Comfortable learning spaces designed for focus and growth.</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <FaFlask className="text-theme-green text-2xl" />
                      <div className="font-bold text-theme-dark">Labs & Activities</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">Hands-on learning through science and creative activities.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;

