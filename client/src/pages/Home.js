import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import '../components/home/HomeStyles.css';
import '../components/home/CleanThemeStyles.css';

import { FaCheckCircle, FaUsers, FaGraduationCap, FaLeaf, FaGlobe, FaHeart, FaQuoteRight, FaChevronRight } from 'react-icons/fa';

// Animation Variants
const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const Home = () => {
  const navigate = useNavigate();

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
        
        {/* Educational Vision - Clean Light Theme */}
        <motion.section 
          className="clean-light-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="clean-section-header"
              variants={fadeUpVariant}
            >
              <h2 className="clean-section-title">Educational Vision</h2>
              <p className="clean-section-subtitle">
                At The First Steps School, education is not about memorization or competition. 
                It is about building capable, ethical, and confident human beings.
              </p>
            </motion.div>

            <motion.div 
              className="clean-cards-grid"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaCheckCircle className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Purpose-Driven Education</h3>
                <p className="clean-card-text">
                  We blend modern educational research with enduring values—respect, responsibility, 
                  empathy, and discipline.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaCheckCircle className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Individualized Learning</h3>
                <p className="clean-card-text">
                  Every child is seen as an individual learner with unique strengths and potential. 
                  We guide students to think, question, create, and grow.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaCheckCircle className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Structured Environment</h3>
                <p className="clean-card-text">
                  Our environment nurtures curiosity with structure, independence with guidance, 
                  and creativity with academic rigor.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Structured Learning - Clean Light Theme */}
        <motion.section 
          className="clean-gray-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="clean-section-header"
              variants={fadeUpVariant}
            >
              <h2 className="clean-section-title">Structured, Research-Informed Learning</h2>
              <p className="clean-section-subtitle">
                We follow a carefully designed progression that builds skills step by step, 
                ensuring strong foundations before advanced learning.
              </p>
            </motion.div>

            <motion.div 
              className="clean-cards-grid"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="clean-card clean-numbered-card"
                variants={cardVariant}
              >
                <div className="clean-serif-number">01</div>
                <h3 className="clean-card-title">Developmentally Appropriate</h3>
                <p className="clean-card-text">
                  Instruction is clearly sequenced across grades and balanced between 
                  knowledge, skills, and application.
                </p>
                <div className="clean-badge">
                  <FaCheckCircle className="clean-badge-icon" />
                  <span>Deep understanding over surface coverage</span>
                </div>
              </motion.div>

              <motion.div 
                className="clean-card clean-numbered-card"
                variants={cardVariant}
              >
                <div className="clean-serif-number">02</div>
                <h3 className="clean-card-title">Teaching Independent Thinkers</h3>
                <p className="clean-card-text">
                  Our teachers are trained to teach students how to think, not just what to learn. 
                  Learning is supported through clear modelling and guided practice.
                </p>
                <div className="clean-badge">
                  <FaCheckCircle className="clean-badge-icon" />
                  <span>No child is rushed. No child is overlooked.</span>
                </div>
              </motion.div>

              <motion.div 
                className="clean-card clean-numbered-card"
                variants={cardVariant}
              >
                <div className="clean-serif-number">03</div>
                <h3 className="clean-card-title">Balanced Use of Technology</h3>
                <p className="clean-card-text">
                  Technology is used purposefully, not excessively—to support research and 
                  exploration, skill reinforcement, and communication.
                </p>
                <div className="clean-badge">
                  <FaCheckCircle className="clean-badge-icon" />
                  <span>Screens never replace teachers, books, or hands-on learning</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Who We Are Section - Hybrid Clean/Dark Theme */}
        <motion.section 
          className="clean-light-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="clean-hybrid-grid"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="clean-hybrid-left"
                variants={fadeUpVariant}
              >
                <h2 className="clean-section-title clean-left-align">Who We Are</h2>
                <p className="clean-lead-text">
                  The First Steps School is an independent, progressive day school committed 
                  to nurturing the whole child.
                </p>
                <p className="clean-body-text">
                  Founded and led by <strong>Imdad Baloch</strong>, the school combines progressive teaching 
                  with the cultural values that anchor our community. Every lesson, project, 
                  and conversation is designed to strengthen learning, character, and the 
                  practical life skills students need to thrive in a changing world.
                </p>
                
                {/* <motion.div 
                  className="clean-stats-row"
                  variants={staggerContainerVariant}
                >
                  <motion.div 
                    className="clean-stat-box"
                    variants={cardVariant}
                  >
                    <div className="clean-stat-value">Playgroup</div>
                    <div className="clean-stat-label">Start</div>
                  </motion.div> */}
                  {/* <motion.div 
                    className="clean-stat-box"
                    variants={cardVariant}
                  >
                    <div className="clean-stat-value">Grade 10</div>
                    <div className="clean-stat-label">Finish</div>
                  </motion.div> */}
                  {/* <motion.div 
                    className="clean-stat-box"
                    variants={cardVariant}
                  >
                    <div className="clean-stat-value">Small</div>
                    <div className="clean-stat-label">Classes</div>
                  </motion.div> */}
                {/* </motion.div> */}
              </motion.div>

              <motion.div 
                className="clean-hybrid-right"
                variants={fadeUpVariant}
              >
                <div className="clean-dark-quote-card">
                  <div className="clean-quote-icon">
                    <FaQuoteRight />
                  </div>
                  <blockquote className="clean-quote-text">
                    "Teaching students <span className="clean-quote-highlight">how to think</span>, not just what to learn."
                  </blockquote>
                  <div className="clean-quote-author">Our Philosophy</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>


        {/* What Makes Us Different - Clean Gray Theme */}
        <motion.section 
          className="clean-gray-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="clean-section-header"
              variants={fadeUpVariant}
            >
              <h2 className="clean-section-title">What Makes Us Different</h2>
              <p className="clean-section-subtitle">
                Distinctive educational principles that set our institution apart
              </p>
            </motion.div>

            <motion.div 
              className="clean-cards-grid"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaUsers className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Small Class Sizes & Individual Mentorship</h3>
                <p className="clean-card-text">
                  Teachers have time to know each child well, close learning gaps early, and 
                  build meaningful mentor relationships.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaHeart className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Inclusive, Respectful Culture</h3>
                <p className="clean-card-text">
                  We welcome diversity of belief, ability, and background—while actively building 
                  empathy, dignity, and civic responsibility.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaLeaf className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Sustainability & Service Projects</h3>
                <p className="clean-card-text">
                  Students learn stewardship and social impact through action—from campus 
                  initiatives to community outreach.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaGlobe className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Local Relevance, Global Awareness</h3>
                <p className="clean-card-text">
                  Learning is rooted in local language, culture, and identity—while preparing 
                  students to engage confidently with the wider world.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaGraduationCap className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Academic Excellence with Character</h3>
                <p className="clean-card-text">
                  We hold high academic expectations while giving equal importance to values, 
                  behavior, and emotional growth.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Why Families Choose Us - Clean Light Theme */}
        <motion.section 
          className="clean-light-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="clean-section-header"
              variants={fadeUpVariant}
            >
              <h2 className="clean-section-title">Why Families Choose Us</h2>
              <p className="clean-section-subtitle">
                The reasons discerning parents entrust us with their children's education
              </p>
            </motion.div>

            <motion.div 
              className="clean-cards-grid"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaCheckCircle className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Research-Informed Learning</h3>
                <p className="clean-card-text">
                  Structured, research-informed learning that builds strong foundations and critical thinking skills.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaCheckCircle className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Language & Thinking Skills</h3>
                <p className="clean-card-text">
                  Strong focus on language development and thinking skills that prepare students for lifelong learning.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaCheckCircle className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Respectful Environment</h3>
                <p className="clean-card-text">
                  Calm, respectful classrooms where every student feels valued and supported in their learning journey.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaCheckCircle className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Deep Understanding</h3>
                <p className="clean-card-text">
                  Teaching that values understanding over memorization, fostering genuine comprehension and application.
                </p>
              </motion.div>

              <motion.div 
                className="clean-card"
                variants={cardVariant}
              >
                <div className="clean-icon-circle">
                  <FaCheckCircle className="clean-icon" />
                </div>
                <h3 className="clean-card-title">Life Preparation</h3>
                <p className="clean-card-text">
                  A school that prepares children for life—not just exams—building character alongside academics.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>


        {/* CTA Section
        <section className="cta-section">
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
        </section> */}
      </div>
    </>
  );
};

export default Home;