import React from 'react';
import { FaChalkboardTeacher, FaGlobe, FaUserGraduate, FaHandsHelping } from 'react-icons/fa';

const FeaturesStrip = () => {
  const items = [
    {
      title: 'Education Services',
      subtitle: 'Academic support & guidance',
      Icon: FaChalkboardTeacher,
    },
    {
      title: 'International Hub',
      subtitle: 'Diverse and welcoming community',
      Icon: FaGlobe,
    },
    {
      title: "Bachelor's & Master's",
      subtitle: 'Programs designed for success',
      Icon: FaUserGraduate,
    },
    {
      title: 'Alumni Services',
      subtitle: 'Lifelong network & mentorship',
      Icon: FaHandsHelping,
    },
  ];

  return (
    <section className="bg-theme-blue">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map(({ title, subtitle, Icon }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="shrink-0">
                <Icon className="text-theme-green text-3xl" />
              </div>
              <div>
                <div className="text-white font-bold leading-tight">{title}</div>
                <div className="text-gray-300 text-sm mt-1">{subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesStrip;
