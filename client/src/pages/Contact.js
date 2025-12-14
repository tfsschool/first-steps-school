import React from 'react';
import SEO from '../components/SEO';

const Contact = () => {
  // Social media links - update these with your actual profile URLs
  const socialLinks = {
    facebook: 'https://www.facebook.com/your-profile', // Update with actual Facebook URL
    linkedin: 'https://www.linkedin.com/company/your-profile', // Update with actual LinkedIn URL
    youtube: 'https://www.youtube.com/@your-channel', // Update with actual YouTube URL
  };

  // Google Maps embed URL for The First Steps School
  // Location: Jinnah Town, Quetta (30.223598, 66.9838663)
  // Place ID: 0x3ed2e07a825ba725:0x1a024e12479a6508
  const googleMapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.5!2d66.9864412!3d30.2235934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ed2e07a825ba725%3A0x1a024e12479a6508!2sThe%20First%20Steps%20School!5e0!3m2!1sen!2s!4v1736784000000!5m2!1sen!2s";

  return (
    <>
      <SEO 
        title="Contact Us - First Steps School" 
        description="Get in touch with First Steps School. Visit us at H#1, Babai Villas, Jinnah Town, Quetta or contact us via phone, email, or social media."
        canonicalUrl="/contact"
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Contact Us</h1>
            <p className="text-center text-gray-600 mb-12">
              We'd love to hear from you. Get in touch with us through any of the following ways.
            </p>

            {/* Contact Information Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Address */}
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="font-bold text-lg mb-3 text-gray-800">Postal Address</h3>
                <p className="text-gray-600 leading-relaxed">
                  H#1, Babai Villas,<br />
                  Jinnah Town,<br />
                  Quetta
                </p>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">📞</div>
                <h3 className="font-bold text-lg mb-3 text-gray-800">Call & WhatsApp</h3>
                <p className="text-gray-600">
                  <a 
                    href="tel:03123880000" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Phone: 03123880000
                  </a>
                </p>
              </div>

              {/* Email */}
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="font-bold text-lg mb-3 text-gray-800">E-mail</h3>
                <p className="text-gray-600">
                  <a 
                    href="mailto:info@tfs.school" 
                    className="hover:text-blue-600 transition-colors break-all"
                  >
                    info@tfs.school
                  </a>
                </p>
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Find Us on Map</h2>
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <iframe
                  src={googleMapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="First Steps School Location"
                ></iframe>
              </div>
              <p className="text-center text-gray-600 mt-4 text-sm">
                <a 
                  href="https://www.google.com/maps/place/The+First+Steps+School/@30.223598,66.9838663,17z/data=!3m1!4b1!4m6!3m5!1s0x3ed2e07a825ba725:0x1a024e12479a6508!8m2!3d30.2235934!4d66.9864412!16s%2Fg%2F11hbt7bc81?hl=en&entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open in Google Maps
                </a>
              </p>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Follow Us</h2>
              <div className="flex justify-center items-center gap-6">
                {/* Facebook */}
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-14 h-14 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors transform hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors transform hover:scale-110"
                  aria-label="YouTube"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
