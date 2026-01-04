import React from 'react';
import SEO from '../components/SEO';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';

const Contact = () => {
  // Social media links
  const socialLinks = {
    facebook: 'https://www.facebook.com/school.tfs/',
    linkedin: 'https://www.linkedin.com/company/the-first-steps/posts/?feedView=all',
    youtube: 'https://www.youtube.com/@thefirststeps1143',
    instagram: 'https://www.instagram.com/school.tfs/',
  };

  // Google Maps embed URL for The First Steps School
  // Location: Jinnah Town, Quetta (30.223598, 66.9838663)
  // Place ID: 0x3ed2e07a825ba725:0x1a024e12479a6508
  const googleMapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.5!2d66.9864412!3d30.2235934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ed2e07a825ba725%3A0x1a024e12479a6508!2sThe%20First%20Steps%20School!5e0!3m2!1sen!2s!4v1736784000000!5m2!1sen!2s";

  return (
    <>
      <SEO 
        title="Contact Us - The First Steps School" 
        description="Get in touch with The First Steps School. Visit us at H#1, Babai Villas, Jinnah Town, Quetta or contact us via phone, email, or social media."
        canonicalUrl="/contact"
      />
      <div className="min-h-screen bg-white">
        <section className="relative bg-theme-blue">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2400&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-theme-blue via-theme-blue/90 to-theme-blue/70" />
          <div className="relative container mx-auto px-4 py-14">
            <div className="max-w-3xl">
              <div className="text-white/80 text-xs tracking-[0.35em] uppercase font-semibold">
                Contact
              </div>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Contact Us
              </h1>
              <p className="mt-4 text-white/85 text-base md:text-lg leading-relaxed">
                We'd love to hear from you. Reach out through any of the options below.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-7">
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
                <div className="w-12 h-12 rounded-full bg-theme-blue/10 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-theme-blue text-xl" />
                </div>
                <h2 className="mt-5 text-xl font-extrabold text-theme-dark">Postal Address</h2>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  H#1, Babai Villas,
                  <br />
                  Jinnah Town,
                  <br />
                  Quetta
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
                <div className="w-12 h-12 rounded-full bg-theme-blue/10 flex items-center justify-center">
                  <FaPhoneAlt className="text-theme-blue text-xl" />
                </div>
                <h2 className="mt-5 text-xl font-extrabold text-theme-dark">Call & WhatsApp</h2>
                <p className="mt-3 text-gray-600">
                  <a
                    href="tel:03123880000"
                    className="font-semibold text-theme-blue hover:text-theme-green transition-colors"
                  >
                    03123880000
                  </a>
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
                <div className="w-12 h-12 rounded-full bg-theme-blue/10 flex items-center justify-center">
                  <FaEnvelope className="text-theme-blue text-xl" />
                </div>
                <h2 className="mt-5 text-xl font-extrabold text-theme-dark">E-mail</h2>
                <p className="mt-3 text-gray-600">
                  <a
                    href="mailto:info@tfs.school"
                    className="font-semibold text-theme-blue hover:text-theme-green transition-colors break-all"
                  >
                    info@tfs.school
                  </a>
                </p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-5 gap-7">
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="text-xs tracking-[0.25em] uppercase text-theme-dark/50 font-semibold">
                    Map
                  </div>
                  <h2 className="mt-2 text-2xl font-extrabold text-theme-dark">Find Us on Map</h2>
                </div>
                <div className="w-full h-96">
                  <iframe
                    src={googleMapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="The First Steps School Location"
                  ></iframe>
                </div>
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                  <a
                    href="https://www.google.com/maps/place/The+First+Steps+School/@30.223598,66.9838663,17z/data=!3m1!4b1!4m6!3m5!1s0x3ed2e07a825ba725:0x1a024e12479a6508!8m2!3d30.2235934!4d66.9864412!16s%2Fg%2F11hbt7bc81?hl=en&entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-theme-blue hover:text-theme-green transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
                <div className="text-xs tracking-[0.25em] uppercase text-theme-dark/50 font-semibold">
                  Social
                </div>
                <h2 className="mt-2 text-2xl font-extrabold text-theme-dark">Follow Us</h2>
                <p className="mt-3 text-gray-600">
                  Stay updated with announcements, events, and admissions.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-white transition"
                    aria-label="Facebook"
                  >
                    <div className="w-10 h-10 rounded-full bg-theme-blue flex items-center justify-center text-white">
                      <FaFacebookF />
                    </div>
                    <div className="font-semibold text-theme-dark">Facebook</div>
                  </a>

                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-white transition"
                    aria-label="YouTube"
                  >
                    <div className="w-10 h-10 rounded-full bg-theme-blue flex items-center justify-center text-white">
                      <FaYoutube />
                    </div>
                    <div className="font-semibold text-theme-dark">YouTube</div>
                  </a>

                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-white transition"
                    aria-label="Instagram"
                  >
                    <div className="w-10 h-10 rounded-full bg-theme-blue flex items-center justify-center text-white">
                      <FaInstagram />
                    </div>
                    <div className="font-semibold text-theme-dark">Instagram</div>
                  </a>

                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-white transition"
                    aria-label="LinkedIn"
                  >
                    <div className="w-10 h-10 rounded-full bg-theme-blue flex items-center justify-center text-white">
                      <FaLinkedinIn />
                    </div>
                    <div className="font-semibold text-theme-dark">LinkedIn</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;
