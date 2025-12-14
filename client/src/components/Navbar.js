import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-blue-900">First Steps School</h1>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li><Link to="/" className="hover:text-orange-500">Home</Link></li>
          <li><Link to="/careers" className="hover:text-orange-500">Careers</Link></li>
          <li><Link to="/contact" className="hover:text-orange-500">Contact Us</Link></li>
        </ul>
      </div>
    </nav>
  );
};
export default Navbar;