import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaPhoneAlt,
} from 'react-icons/fa';

const TopBar = () => {
  const email = 'info@tfs.school';
  const phoneDisplay = '03123880000';
  const phoneHref = 'tel:03123880000';

  const socialLinks = {
    facebook: 'https://www.facebook.com/school.tfs/',
    instagram: 'https://www.instagram.com/school.tfs/',
    youtube: 'https://www.youtube.com/@thefirststeps1143',
    // linkedin: 'https://www.linkedin.com/company/the-first-steps/posts/?feedView=all',
  };

  const iconClass =
    'text-white/80 hover:text-theme-green transition-colors text-lg sm:text-xl';

  return (
    <div className="bg-theme-blue text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 text-sm sm:text-base">
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <FaEnvelope className="text-white/80 text-base sm:text-lg" />
              <span className="hidden sm:inline">{email}</span>
              <span className="sm:hidden">Email</span>
            </a>
            <a
              href={phoneHref}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <FaPhoneAlt className="text-white/80 text-base sm:text-lg" />
              <span className="hidden sm:inline">{phoneDisplay}</span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={iconClass}
            >
              <FaFacebookF />
            </a>
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className={iconClass}
            >
              <FaYoutube />
            </a>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={iconClass}
            >
              <FaInstagram />
            </a>
            {/* <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className={iconClass}
            >
              <FaLinkedinIn />
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
