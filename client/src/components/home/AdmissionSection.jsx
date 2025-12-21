import React from 'react';

const AdmissionSection = () => {
  const imageUrl =
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2400&q=80';

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row overflow-hidden rounded-lg shadow-lg">
          <div className="lg:w-1/2">
            <img
              src={imageUrl}
              alt="Student on campus"
              className="w-full h-72 lg:h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="lg:w-1/2 bg-theme-blue text-white p-10 flex items-center">
            <div>
              <div className="text-theme-green font-semibold tracking-wide">
                Fall 2025 Applications
              </div>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold">
                Apply for Admission
              </h2>
              <p className="mt-4 text-white/90 leading-relaxed">
                Start your journey with The First Steps School. Our admission process is designed to be
                clear and supportive — helping you take the next step with confidence.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  className="bg-theme-green text-white px-8 py-3 rounded-md font-semibold hover:brightness-95 transition"
                >
                  APPLY NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionSection;
