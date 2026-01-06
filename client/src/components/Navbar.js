import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ isShrunk = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Careers', to: '/careers' },
    { label: 'Contact', to: '/contact' },
  ];

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <nav className="bg-white shadow-soft border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 lg:py-5">
          <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo 2025 color.png"
            alt="The First Steps School"
            className={`${isShrunk ? 'h-10' : 'h-10 lg:h-12'} w-auto object-contain transition-all duration-200`}
          />
          </Link>

          <div className="hidden lg:flex flex-1 justify-end">
            <ul className="flex items-center gap-10">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      [
                        'relative text-[13px] font-bold tracking-[0.12em] uppercase text-theme-dark/80',
                        'hover:text-theme-dark transition-colors',
                        "after:content-[''] after:absolute after:left-0 after:-bottom-4 after:h-[3px] after:w-full after:bg-theme-green",
                        'after:origin-left after:scale-x-0 after:transition-transform after:duration-200',
                        'hover:after:scale-x-100',
                        isActive ? 'text-theme-dark after:scale-x-100' : '',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden h-11 w-11 rounded-md flex items-center justify-center text-theme-dark/80 hover:text-theme-dark hover:bg-gray-100 transition"
            >
              {mobileOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>

        <div className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ${mobileOpen ? 'max-h-80' : 'max-h-0'}`}>
          <div className="pb-5">
            <div className="border-t border-gray-100 pt-4">
              <nav className="flex flex-col">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'px-3 py-3 rounded-md font-semibold text-theme-dark/80 transition-colors',
                        'hover:bg-gray-50 hover:text-theme-dark',
                        isActive ? 'bg-gray-50 text-theme-dark' : '',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;