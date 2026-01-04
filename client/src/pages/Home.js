import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
// import FeaturesStrip from '../components/home/FeaturesStrip';
import '../components/home/HomeStyles.css';

import { FaBookOpen, FaChalkboardTeacher, FaFlask, FaPalette, FaCheckCircle, FaUsers, FaGraduationCap, FaLeaf, FaGlobe, FaHeart, FaShieldAlt, FaBuilding, FaMicroscope, FaArrowRight, FaQuoteRight, FaChevronRight, FaCaretRight } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SEO 
        title="The First Steps School | Premier Education Institution" 
        description="An established independent school providing research-informed education from Playgroup to Grade 10. Building capable, ethical, and confident individuals."
        canonicalUrl="/"
      />
      
      <div className="academic-website">
        <HeroSection />
        {/* <FeaturesStrip /> */}
        
        {/* Philosophy Section */}
        <section className="philosophy-section" ref={el => sectionsRef.current[0] = el}>
          <div className="academic-container">
            <div className="section-intro">
              <span className="section-label">Our Educational Vision</span>
              <h2 className="section-heading serif-heading">
                Education with Purpose
              </h2>
              <p className="section-subheading">
                We don't just give students an education that sets them up for success. We help them succeed—to discover their passions and dare to lead.
              </p>
            </div>

            <div className="philosophy-content">
              <div className="philosophy-grid">
                <div className="philosophy-left">
                  <div className="philosophy-statement">
                    <h3 className="serif-heading">Our Heart</h3>
                    <p>Discover how we turn potential into achievement.</p>
                    <button className="academic-link">
                      See What Drives Us
                      <FaChevronRight className="link-icon" />
                    </button>
                  </div>
                  
                  <div className="philosophy-text">
                    <p>
                      At The First Steps School, education is not about memorization or competition. 
                      It is about building capable, ethical, and confident human beings.
                    </p>
                    <p>
                      We blend modern educational research with enduring values—respect, responsibility, 
                      empathy, and discipline. Our environment nurtures curiosity with structure, 
                      independence with guidance, and creativity with academic rigor.
                    </p>
                    <p>
                      Every child is seen as an individual learner with unique strengths and potential. 
                      We guide students to think, question, create, and grow into thoughtful members of society.
                    </p>
                  </div>
                </div>

                <div className="philosophy-right">
                  <div className="highlight-card">
                    <div className="highlight-content">
                      <h4 className="serif-heading">A Holistic Educational Experience</h4>
                      <p>
                        Our curriculum blends rigorous academics with hands-on STEM initiatives, 
                        vibrant arts and athletics programs. We believe in nurturing children by 
                        cultivating curiosity, cooperation, and grit.
                      </p>
                    </div>
                    <button className="academic-button filled">
                      Secure a Spot
                      <FaArrowRight className="button-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Approach Section */}
        <section className="approach-section" ref={el => sectionsRef.current[1] = el}>
          <div className="academic-container">
            <div className="section-header">
              <div className="section-header-left">
                <span className="section-label">Academic Framework</span>
                <h2 className="section-heading serif-heading">
                  Structured, Research-Informed Learning
                </h2>
              </div>
              <div className="section-header-right">
                <p>
                  We follow a carefully designed progression that builds skills step by step, 
                  ensuring strong foundations before advanced learning.
                </p>
              </div>
            </div>

            <div className="approach-grid">
              <div className="approach-card">
                <div className="approach-number">01</div>
                <div className="approach-content">
                  <h3 className="serif-heading">Developmentally Appropriate</h3>
                  <p>
                    Instruction is clearly sequenced across grades and balanced between 
                    knowledge, skills, and application.
                  </p>
                  <div className="approach-highlight">
                    <FaCheckCircle className="highlight-icon" />
                    <span>We prioritize deep understanding over surface coverage</span>
                  </div>
                </div>
              </div>

              <div className="approach-card">
                <div className="approach-number">02</div>
                <div className="approach-content">
                  <h3 className="serif-heading">Teaching Independent Thinkers</h3>
                  <p>
                    Our teachers are trained to teach students how to think, not just what to learn. 
                    Learning is supported through clear modelling and guided practice.
                  </p>
                  <div className="approach-highlight">
                    <FaCheckCircle className="highlight-icon" />
                    <span>No child is rushed. No child is overlooked.</span>
                  </div>
                </div>
              </div>

              <div className="approach-card">
                <div className="approach-number">03</div>
                <div className="approach-content">
                  <h3 className="serif-heading">Balanced Use of Technology</h3>
                  <p>
                    Technology is used purposefully, not excessively—to support research and 
                    exploration, skill reinforcement, and communication.
                  </p>
                  <div className="approach-highlight">
                    <FaCheckCircle className="highlight-icon" />
                    <span>Screens never replace teachers, books, or hands-on learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Are Section */}
        <section className="identity-section" ref={el => sectionsRef.current[2] = el}>
          <div className="academic-container">
            <div className="identity-grid">
              <div className="identity-left">
                <div className="identity-content">
                  <span className="section-label">Our Institution</span>
                  <h2 className="section-heading serif-heading">Who We Are</h2>
                  <p className="identity-lead">
                    The First Steps School is an independent, progressive day school committed 
                    to nurturing the whole child.
                  </p>
                  <p>
                    Founded and led by Imdad Baloch, the school combines progressive teaching 
                    with the cultural values that anchor our community. Every lesson, project, 
                    and conversation is designed to strengthen learning, character, and the 
                    practical life skills students need to thrive in a changing world.
                  </p>
                  
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">Playgroup</div>
                      <div className="stat-label">Starting Age</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">Grade 10</div>
                      <div className="stat-label">Highest Grade</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">Small</div>
                      <div className="stat-label">Class Sizes</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="identity-right">
                <div className="quote-card">
                  <div className="quote-icon">
                    <FaQuoteRight />
                  </div>
                  <blockquote className="quote-text">
                    "Teaching students how to think, not just what to learn."
                  </blockquote>
                  <div className="quote-author">
                    <div className="author-name">Our Philosophy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="programs-section" ref={el => sectionsRef.current[3] = el}>
          <div className="academic-container">
            <div className="programs-header">
              <div className="programs-header-left">
                <span className="section-label">Academic Programs</span>
                <h2 className="section-heading serif-heading">Programs & Learning</h2>
              </div>
              <div className="programs-header-right">
                <button className="academic-button outlined" onClick={() => navigate('/admissions')}>
                  Apply for Admission
                  <FaCaretRight className="button-icon" />
                </button>
              </div>
            </div>

            <div className="programs-grid">
              <div className="program-card">
                <div className="program-icon">
                  <FaBookOpen />
                </div>
                <div className="program-content">
                  <h3 className="serif-heading">Primary School</h3>
                  <p>Strong foundations in literacy, numeracy, and confidence-building.</p>
                  <div className="program-meta">Playgroup to Grade 5</div>
                </div>
              </div>

              <div className="program-card">
                <div className="program-icon">
                  <FaChalkboardTeacher />
                </div>
                <div className="program-content">
                  <h3 className="serif-heading">Middle School</h3>
                  <p>Study habits, critical thinking, and student leadership.</p>
                  <div className="program-meta">Grade 6 to Grade 8</div>
                </div>
              </div>

              <div className="program-card">
                <div className="program-icon">
                  <FaFlask />
                </div>
                <div className="program-content">
                  <h3 className="serif-heading">STEM Learning</h3>
                  <p>Hands-on activities, experiments, and problem-solving.</p>
                  <div className="program-meta">Laboratory Focus</div>
                </div>
              </div>

              <div className="program-card">
                <div className="program-icon">
                  <FaPalette />
                </div>
                <div className="program-content">
                  <h3 className="serif-heading">Arts & Activities</h3>
                  <p>Creativity, confidence, and well-rounded development.</p>
                  <div className="program-meta">Creative Development</div>
                </div>
              </div>
            </div>

            <div className="programs-description">
              <p>
                We are committed to providing a supportive learning environment for every child — 
                building strong foundations, confidence, and character from <strong>Playgroup</strong> 
                to <strong>Grade 10</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Distinctions Section */}
        <section className="distinctions-section" ref={el => sectionsRef.current[4] = el}>
          <div className="academic-container">
            <div className="section-intro centered">
              <span className="section-label">Our Distinctions</span>
              <h2 className="section-heading serif-heading">What Makes Us Different</h2>
              <p className="section-subheading">
                Distinctive educational principles that set our institution apart
              </p>
            </div>

            <div className="distinctions-grid">
              <div className="distinction-card">
                <div className="distinction-header">
                  <div className="distinction-icon">
                    <FaUsers />
                  </div>
                  <h3 className="serif-heading">Small Class Sizes</h3>
                </div>
                <p className="distinction-text">
                  Teachers have time to know each child well, close learning gaps early, and 
                  build meaningful mentor relationships.
                </p>
              </div>

              <div className="distinction-card">
                <div className="distinction-header">
                  <div className="distinction-icon">
                    <FaHeart />
                  </div>
                  <h3 className="serif-heading">Inclusive Culture</h3>
                </div>
                <p className="distinction-text">
                  We welcome diversity of belief, ability, and background—while actively building 
                  empathy, dignity, and civic responsibility.
                </p>
              </div>

              <div className="distinction-card">
                <div className="distinction-header">
                  <div className="distinction-icon">
                    <FaLeaf />
                  </div>
                  <h3 className="serif-heading">Sustainability Projects</h3>
                </div>
                <p className="distinction-text">
                  Students learn stewardship and social impact through action—from campus 
                  initiatives to community outreach.
                </p>
              </div>

              <div className="distinction-card">
                <div className="distinction-header">
                  <div className="distinction-icon">
                    <FaGlobe />
                  </div>
                  <h3 className="serif-heading">Global Awareness</h3>
                </div>
                <p className="distinction-text">
                  Learning is rooted in local language, culture, and identity—while preparing 
                  students to engage confidently with the wider world.
                </p>
              </div>

              <div className="distinction-card">
                <div className="distinction-header">
                  <div className="distinction-icon">
                    <FaGraduationCap />
                  </div>
                  <h3 className="serif-heading">Academic Excellence</h3>
                </div>
                <p className="distinction-text">
                  We hold high academic expectations while giving equal importance to values, 
                  behavior, and emotional growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Families Section */}
        <section className="families-section" ref={el => sectionsRef.current[5] = el}>
          <div className="academic-container">
            <div className="families-content">
              <div className="families-left">
                <span className="section-label">Parent & Guardian Perspective</span>
                <h2 className="section-heading serif-heading">Why Families Choose Us</h2>
                <p className="families-subheading">
                  The reasons discerning parents entrust us with their children's education
                </p>
                
                <div className="reasons-grid">
                  <div className="reason-item">
                    <FaCheckCircle className="reason-icon" />
                    <span>Structured, research-informed learning</span>
                  </div>
                  <div className="reason-item">
                    <FaCheckCircle className="reason-icon" />
                    <span>Strong focus on language and thinking skills</span>
                  </div>
                  <div className="reason-item">
                    <FaCheckCircle className="reason-icon" />
                    <span>Calm, respectful classrooms</span>
                  </div>
                  <div className="reason-item">
                    <FaCheckCircle className="reason-icon" />
                    <span>Teaching that values understanding over memorization</span>
                  </div>
                  <div className="reason-item">
                    <FaCheckCircle className="reason-icon" />
                    <span>A school that prepares children for life—not just exams</span>
                  </div>
                </div>
              </div>

              <div className="families-right">
                <div className="families-note">
                  <div className="note-header">
                    <h4 className="serif-heading">The Student Experience</h4>
                    <p>See how our students thrive through arts, athletics, and a variety of extracurricular activities.</p>
                  </div>
                  <button className="academic-link">
                    Discover Student Life
                    <FaChevronRight className="link-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <section className="facilities-section" ref={el => sectionsRef.current[6] = el}>
          <div className="academic-container">
            <div className="facilities-grid">
              <div className="facilities-left">
                <div className="facilities-content">
                  <span className="section-label">Campus & Environment</span>
                  <h2 className="section-heading serif-heading">Facilities & Safety</h2>
                  <p className="facilities-description">
                    A campus designed for learning, creativity, and wellbeing — supported by 
                    reliable transport and strong safety practices.
                  </p>

                  <div className="facilities-features">
                    <div className="feature-item">
                      <div className="feature-icon">
                        <FaBuilding />
                      </div>
                      <div className="feature-content">
                        <h4 className="serif-heading">Modern Classrooms</h4>
                        <p>Comfortable learning spaces designed for focus and growth.</p>
                      </div>
                    </div>

                    <div className="feature-item">
                      <div className="feature-icon">
                        <FaMicroscope />
                      </div>
                      <div className="feature-content">
                        <h4 className="serif-heading">Labs & Activities</h4>
                        <p>Hands-on learning through science and creative activities.</p>
                      </div>
                    </div>

                    <div className="feature-item">
                      <div className="feature-icon">
                        <FaShieldAlt />
                      </div>
                      <div className="feature-content">
                        <h4 className="serif-heading">Comprehensive Safety</h4>
                        <p>Secure campus with trained staff and established protocols.</p>
                      </div>
                    </div>
                  </div>

                  <button className="academic-button filled" onClick={() => navigate('/campus-tour')}>
                    Schedule a Campus Tour
                    <FaArrowRight className="button-icon" />
                  </button>
                </div>
              </div>

              <div className="facilities-right">
                <div className="campus-visual">
                  <div className="campus-image-container">
                    <img 
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80" 
                      alt="The First Steps School Campus"
                      className="campus-image"
                    />
                  </div>
                  <div className="campus-overlay">
                    <div className="overlay-content">
                      <h4 className="serif-heading">Discover Our Community</h4>
                      <p>Find Your Perfect School</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" ref={el => sectionsRef.current[7] = el}>
          <div className="academic-container">
            <div className="cta-content">
              <h2 className="cta-heading serif-heading">Ready to Take the First Step?</h2>
              <p className="cta-text">
                We are committed to providing a supportive learning environment for every child. 
                Our focus is on strong academics, co-curricular growth, and a safe, caring campus 
                where students feel motivated to achieve.
              </p>
              <div className="cta-buttons">
                <button className="academic-button filled" onClick={() => navigate('/admissions')}>
                  Apply for Admission
                  <FaArrowRight className="button-icon" />
                </button>
                <button className="academic-button outlined" onClick={() => navigate('/contact')}>
                  Contact Admissions
                  <FaCaretRight className="button-icon" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;