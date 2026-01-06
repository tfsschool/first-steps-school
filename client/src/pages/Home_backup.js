import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import '../components/home/HomeStyles.css';

import { CheckCircle2, Users, GraduationCap, Leaf, Globe2, HeartHandshake, Quote } from 'lucide-react';

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
  return (
    <>
      <SEO 
        title="The First Steps School | Premier Education Institution" 
        description="An established independent school providing research-informed education from Playgroup to Grade 10. Building capable, ethical, and confident individuals."
        canonicalUrl="/"
      />
      
      <div className="academic-website">
        <HeroSection />
        
        {/* Educational Vision - Modern Dark Theme */}
        <motion.section 
          className="modern-dark-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="section-intro centered"
              variants={fadeUpVariant}
            >
              <span className="section-label">Our Foundation</span>
              <h2 className="section-title gradient-text">Educational Vision</h2>
              <p className="section-subheading">
                At The First Steps School, education is not about memorization or competition. 
                It is about building capable, ethical, and confident human beings.
              </p>
            </motion.div>

            <motion.div 
              className="modern-grid"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="modern-card distinction-card distinction-green"
                variants={cardVariant}
              >
                <div className="distinction-icon-box">
                  <CheckCircle2 className="distinction-icon" size={24} />
                </div>
                <h3 className="distinction-title">Purpose-Driven Education</h3>
                <p className="distinction-text">
                  We blend modern educational research with enduring values—respect, responsibility, 
                  empathy, and discipline.
                </p>
              </motion.div>

              <motion.div 
                className="modern-card distinction-card distinction-blue"
                variants={cardVariant}
              >
                <div className="distinction-icon-box">
                  <CheckCircle2 className="distinction-icon" size={24} />
                </div>
                <h3 className="distinction-title">Individualized Learning</h3>
                <p className="distinction-text">
                  Every child is seen as an individual learner with unique strengths and potential. 
                  We guide students to think, question, create, and grow.
                </p>
              </motion.div>

              <motion.div 
                className="modern-card distinction-card distinction-purple"
                variants={cardVariant}
              >
                <div className="distinction-icon-box">
                  <CheckCircle2 className="distinction-icon" size={24} />
                </div>
                <h3 className="distinction-title">Structured Environment</h3>
                <p className="distinction-text">
                  Our environment nurtures curiosity with structure, independence with guidance, 
                  and creativity with academic rigor.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Approach Section - Modern Dark Theme */}
        <motion.section 
          className="modern-dark-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="approach-header-modern"
              variants={fadeUpVariant}
            >
              <div className="approach-header-left">
                <span className="section-label">Academic Framework</span>
                <h2 className="section-title gradient-text">
                  Structured, Research-Informed Learning
                </h2>
              </div>
              <div className="approach-header-right">
                <p className="section-subheading">
                  We follow a carefully designed progression that builds skills step by step, 
                  ensuring strong foundations before advanced learning.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="modern-grid"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="modern-card distinction-card approach-card-modern"
                variants={cardVariant}
              >
                <div className="approach-number-modern">01</div>
                <h3 className="distinction-title approach-title-green">Developmentally Appropriate</h3>
                <p className="distinction-text">
                  Instruction is clearly sequenced across grades and balanced between 
                  knowledge, skills, and application.
                </p>
                <div className="approach-badge">
                  <CheckCircle2 className="badge-icon" size={20} />
                  <span>Deep understanding over surface coverage</span>
                </div>
              </motion.div>

              <motion.div 
                className="modern-card distinction-card approach-card-modern"
                variants={cardVariant}
              >
                <div className="approach-number-modern">02</div>
                <h3 className="distinction-title approach-title-blue">Teaching Independent Thinkers</h3>
                <p className="distinction-text">
                  Our teachers are trained to teach students how to think, not just what to learn. 
                  Learning is supported through clear modelling and guided practice.
                </p>
                <div className="approach-badge">
                  <CheckCircle2 className="badge-icon" size={20} />
                  <span>No child is rushed. No child is overlooked.</span>
                </div>
              </motion.div>

              <motion.div 
                className="modern-card distinction-card approach-card-modern"
                variants={cardVariant}
              >
                <div className="approach-number-modern">03</div>
                <h3 className="distinction-title approach-title-purple">Balanced Use of Technology</h3>
                <p className="distinction-text">
                  Technology is used purposefully, not excessively—to support research and 
                  exploration, skill reinforcement, and communication.
                </p>
                <div className="approach-badge">
                  <CheckCircle2 className="badge-icon" size={20} />
                  <span>Screens never replace teachers, books, or hands-on learning</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Who We Are Section - Modern Dark Theme */}
        <motion.section 
          className="modern-dark-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="identity-grid-modern"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="identity-left-modern"
                variants={fadeUpVariant}
              >
                <span className="section-label">Our Institution</span>
                <h2 className="section-title gradient-text">Who We Are</h2>
                <p className="identity-lead-modern">
                  The First Steps School is an independent, progressive day school committed 
                  to nurturing the whole child.
                </p>
                <p className="identity-text-modern">
                  Founded and led by <strong>Imdad Baloch</strong>, the school combines progressive teaching 
                  with the cultural values that anchor our community. Every lesson, project, 
                  and conversation is designed to strengthen learning, character, and the 
                  practical life skills students need to thrive in a changing world.
                </p>
                
                <motion.div 
                  className="stats-grid-modern"
                  variants={staggerContainerVariant}
                >
                  <motion.div 
                    className="stat-item-modern stat-green"
                    variants={cardVariant}
                  >
                    <div className="stat-number-modern">PG</div>
                    <div className="stat-label-modern">Start</div>
                  </motion.div>
                  <motion.div 
                    className="stat-item-modern stat-blue"
                    variants={cardVariant}
                  >
                    <div className="stat-number-modern">10th</div>
                    <div className="stat-label-modern">Grade</div>
                  </motion.div>
                  <motion.div 
                    className="stat-item-modern stat-purple"
                    variants={cardVariant}
                  >
                    <div className="stat-number-modern">1:15</div>
                    <div className="stat-label-modern">Ratio</div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div 
                className="identity-right-modern"
                variants={fadeUpVariant}
              >
                <div className="quote-card-modern">
                  <div className="quote-icon-modern">
                    <Quote size={32} />
                  </div>
                  <blockquote className="quote-text-modern">
                    "Teaching students <span className="gradient-text">how to think</span>, not just what to learn."
                  </blockquote>
                  <div className="quote-divider"></div>
                  <div className="quote-author-modern">Our Philosophy</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Distinctions Section */}
        <motion.section 
          className="distinctions-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="section-intro centered"
              variants={fadeUpVariant}
            >
              <span className="section-label">Our Distinctions</span>
              <h2 className="section-title gradient-text">What Makes Us Different</h2>
              <p className="section-subheading">
                Distinctive educational principles that set our institution apart
              </p>
            </motion.div>

            <motion.div 
              className="distinctions-grid"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="distinction-card service-card distinction-orange"
                variants={cardVariant}
              >
                <div className="distinction-icon-box">
                  <Users className="distinction-icon" size={24} />
                </div>
                <h3 className="distinction-title">Small Class Sizes</h3>
                <p className="distinction-text">
                  Teachers have time to know each child well, close learning gaps early, and 
                  build meaningful mentor relationships.
                </p>
              </motion.div>

              <motion.div 
                className="distinction-card service-card distinction-blue"
                variants={cardVariant}
              >
                <div className="distinction-icon-box">
                  <HeartHandshake className="distinction-icon" size={24} />
                </div>
                <h3 className="distinction-title">Inclusive Culture</h3>
                <p className="distinction-text">
                  We welcome diversity of belief, ability, and background—while actively building 
                  empathy, dignity, and civic responsibility.
                </p>
              </motion.div>

              <motion.div 
                className="distinction-card service-card distinction-orange"
                variants={cardVariant}
              >
                <div className="distinction-icon-box">
                  <Leaf className="distinction-icon" size={24} />
                </div>
                <h3 className="distinction-title">Sustainability Projects</h3>
                <p className="distinction-text">
                  Students learn stewardship and social impact through action—from campus 
                  initiatives to community outreach.
                </p>
              </motion.div>

              <motion.div 
                className="distinction-card service-card distinction-blue"
                variants={cardVariant}
              >
                <div className="distinction-icon-box">
                  <Globe2 className="distinction-icon" size={24} />
                </div>
                <h3 className="distinction-title">Global Awareness</h3>
                <p className="distinction-text">
                  Learning is rooted in local language, culture, and identity—while preparing 
                  students to engage confidently with the wider world.
                </p>
              </motion.div>

              <motion.div 
                className="distinction-card service-card distinction-orange"
                variants={cardVariant}
              >
                <div className="distinction-icon-box">
                  <GraduationCap className="distinction-icon" size={24} />
                </div>
                <h3 className="distinction-title">Academic Excellence</h3>
                <p className="distinction-text">
                  We hold high academic expectations while giving equal importance to values, 
                  behavior, and emotional growth.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Families Section */}
        <motion.section 
          className="families-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="academic-container">
            <motion.div 
              className="families-content"
              variants={staggerContainerVariant}
            >
              <motion.div 
                className="families-left"
                variants={fadeUpVariant}
              >
                <span className="section-label">Parent & Guardian Perspective</span>
                <h2 className="section-heading serif-heading">Why Families Choose Us</h2>
                <p className="families-subheading">
                  The reasons discerning parents entrust us with their children's education
                </p>
                
                <motion.div 
                  className="reasons-grid"
                  variants={staggerContainerVariant}
                >
                  <motion.div className="reason-item" variants={cardVariant}>
                    <CheckCircle2 className="reason-icon" size={16} />
                    <span>Structured, research-informed learning</span>
                  </motion.div>
                  <motion.div className="reason-item" variants={cardVariant}>
                    <CheckCircle2 className="reason-icon" size={16} />
                    <span>Strong focus on language and thinking skills</span>
                  </motion.div>
                  <motion.div className="reason-item" variants={cardVariant}>
                    <CheckCircle2 className="reason-icon" size={16} />
                    <span>Calm, respectful classrooms</span>
                  </motion.div>
                  <motion.div className="reason-item" variants={cardVariant}>
                    <CheckCircle2 className="reason-icon" size={16} />
                    <span>Teaching that values understanding over memorization</span>
                  </motion.div>
                  <motion.div className="reason-item" variants={cardVariant}>
                    <CheckCircle2 className="reason-icon" size={16} />
                    <span>A school that prepares children for life—not just exams</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default Home;
