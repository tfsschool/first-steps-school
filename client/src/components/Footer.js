import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const year = new Date().getFullYear();

  const socialLinks = {
    facebook: 'https://www.facebook.com/your-profile',
    instagram: 'https://www.instagram.com/your-profile',
    youtube: 'https://www.youtube.com/@your-channel',
    linkedin: 'https://www.linkedin.com/company/your-profile',
  };

  return (
    <footer className="bg-theme-blue text-white">
      <div className="container mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo192.jpeg"
                alt="The First Steps School"
                className="h-12 w-12 rounded bg-white object-contain"
              />
              <div>
                <div className="text-lg font-extrabold tracking-tight">The First Steps School</div>
                <div className="text-white/70 text-sm">Empowering Young Minds</div>
              </div>
            </div>

            <p className="mt-5 text-white/80 text-sm leading-relaxed">
              A modern learning environment that inspires confidence, curiosity, and character.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition"
              >
                <FaFacebookF />
              </a>
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition"
              >
                <FaYoutube />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition"
              >
                <FaInstagram />
              </a>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold tracking-[0.2em] uppercase text-white/80">
              Quick Links
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link className="text-white/80 hover:text-theme-green transition" to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-theme-green transition" to="/careers">
                  Careers
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-theme-green transition" to="/contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-theme-green transition" to="/create-profile">
                  Create Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold tracking-[0.2em] uppercase text-white/80">
              Contact
            </div>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3 text-white/80">
                <FaMapMarkerAlt className="mt-1 text-white/60" />
                <span>H#1, Babai Villas, Jinnah Town, Quetta</span>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <FaPhoneAlt className="text-white/60" />
                <a className="hover:text-theme-green transition" href="tel:03123880000">
                  03123880000
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <FaEnvelope className="text-white/60" />
                <a className="hover:text-theme-green transition" href="mailto:info@tfs.school">
                  info@tfs.school
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold tracking-[0.2em] uppercase text-white/80">
              Newsletter
            </div>
            <p className="mt-5 text-white/80 text-sm leading-relaxed">
              Get updates about admissions, events, and new opportunities.
            </p>

            <form
              className="mt-5 flex"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/50 px-4 py-3 outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="bg-theme-green px-5 font-semibold hover:brightness-95 transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/70">
          <div>© {year} The First Steps School. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <button type="button" className="hover:text-white transition">Privacy</button>
            <button type="button" className="hover:text-white transition">Terms</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
