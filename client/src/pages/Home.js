import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <>
      <SEO 
        title="Home" 
        description="Empowering young minds to take their first steps towards a bright future. First Steps School is dedicated to providing quality education and nurturing the potential of every student."
        canonicalUrl="/"
      />
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to First Steps School</h1>
          <p className="text-xl mb-8">Empowering young minds to take their first steps towards a bright future</p>
          <Link to="/careers" className="bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition inline-block">
            View Open Positions
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">About Our School</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              First Steps School is dedicated to providing quality education and nurturing the potential 
              of every student. We believe in creating a supportive learning environment where students 
              can grow, learn, and achieve their dreams.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Education</h3>
              <p className="text-gray-600">Comprehensive curriculum designed to foster critical thinking and creativity</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Experienced Faculty</h3>
              <p className="text-gray-600">Dedicated teachers committed to student success and growth</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌟</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Modern Facilities</h3>
              <p className="text-gray-600">State-of-the-art infrastructure to support effective learning</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-lg mb-6">We're always looking for passionate educators and staff members</p>
          <Link to="/careers" className="bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition inline-block">
            View Careers
          </Link>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;

