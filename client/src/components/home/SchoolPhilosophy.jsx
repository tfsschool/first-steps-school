import React from 'react';
import './HomeStyles.css';

const SchoolPhilosophy = () => {
  return (
    <>
      <section className="kingster-section">
        <div className="kingster-container">
          <div className="kingster-grid-2">
            
            <div>
              <h2 className="kingster-section-title">Education with Purpose</h2>
              <div className="kingster-text-content">
                <p>
                  At The First Steps School, education is not about memorization or competition. It is about building capable, ethical, and confident human beings.
                </p>
                <p>
                  We blend modern educational research with enduring values—respect, responsibility, empathy, and discipline. Our environment nurtures curiosity with structure, independence with guidance, and creativity with academic rigor.
                </p>
                <p>
                  Every child is seen as an individual learner with unique strengths and potential. We guide students to think, question, create, and grow into thoughtful members of society.
                </p>
              </div>
            </div>

            <div>
              <h2 className="kingster-section-title">Who We Are</h2>
              <div className="kingster-text-content">
                <p>
                  The First Steps School is an independent, progressive day school committed to nurturing the whole child.
                </p>
                <p>
                  Founded and led by Imdad Baloch, the school combines progressive teaching with the cultural values that anchor our community. Every lesson, project, and conversation is designed to strengthen learning, character, and the practical life skills students need to thrive in a changing world.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="kingster-section kingster-section-gray">
        <div className="kingster-container">
          <h2 className="kingster-section-title">Our Approach</h2>
          
          <div className="kingster-approach-item">
            <h3 className="kingster-approach-title">Structured, Research-Informed Learning</h3>
            <p className="kingster-approach-text">
              We follow a carefully designed progression that builds skills step by step, ensuring strong foundations before advanced learning. Instruction is:
            </p>
            <ul className="kingster-list">
              <li>Developmentally appropriate</li>
              <li>Clearly sequenced across grades</li>
              <li>Balanced between knowledge, skills, and application</li>
            </ul>
            <p className="kingster-approach-text">
              We prioritize deep understanding over surface coverage.
            </p>
          </div>

          <div className="kingster-approach-item">
            <h3 className="kingster-approach-title">Teaching that Builds Independent Thinkers</h3>
            <p className="kingster-approach-text">
              Our teachers are trained to teach students how to think, not just what to learn. Learning is supported through:
            </p>
            <ul className="kingster-list">
              <li>Clear modelling and guided practice</li>
              <li>Consistent feedback</li>
              <li>Steady, measurable progress</li>
            </ul>
            <p className="kingster-approach-text">
              No child is rushed. No child is overlooked.
            </p>
          </div>

          <div className="kingster-approach-item">
            <h3 className="kingster-approach-title">Balanced Use of Technology</h3>
            <p className="kingster-approach-text">
              Technology is used purposefully, not excessively—to support:
            </p>
            <ul className="kingster-list">
              <li>Research and exploration</li>
              <li>Skill reinforcement</li>
              <li>Communication and organization</li>
            </ul>
            <p className="kingster-approach-text">
              Screens never replace teachers, books, or hands-on learning.
            </p>
          </div>
        </div>
      </section>

      <section className="kingster-section">
        <div className="kingster-container">
          <div className="kingster-feature-box">
            <h2 className="kingster-section-title kingster-section-title-white">
              What Makes Us Different
            </h2>
            
            <div className="kingster-grid-2" style={{ marginTop: '40px' }}>
              <div className="kingster-feature-item">
                <h3 className="kingster-feature-title">Small Class Sizes & Individual Mentorship</h3>
                <p className="kingster-feature-text">
                  Teachers have time to know each child well, close learning gaps early, and build meaningful mentor relationships.
                </p>
              </div>

              <div className="kingster-feature-item">
                <h3 className="kingster-feature-title">Inclusive, Respectful Culture</h3>
                <p className="kingster-feature-text">
                  We welcome diversity of belief, ability, and background—while actively building empathy, dignity, and civic responsibility.
                </p>
              </div>

              <div className="kingster-feature-item">
                <h3 className="kingster-feature-title">Sustainability & Service Projects</h3>
                <p className="kingster-feature-text">
                  Students learn stewardship and social impact through action—from campus initiatives to community outreach.
                </p>
              </div>

              <div className="kingster-feature-item">
                <h3 className="kingster-feature-title">Local Relevance, Global Awareness</h3>
                <p className="kingster-feature-text">
                  Learning is rooted in local language, culture, and identity—while preparing students to engage confidently with the wider world.
                </p>
              </div>

              <div className="kingster-feature-item" style={{ gridColumn: 'span 2' }}>
                <h3 className="kingster-feature-title">Academic Excellence with Character</h3>
                <p className="kingster-feature-text">
                  We hold high academic expectations while giving equal importance to values, behavior, and emotional growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="kingster-section kingster-section-gray">
        <div className="kingster-container">
          <h2 className="kingster-section-title">Why Families Choose Us</h2>
          <div className="kingster-card">
            <ul className="kingster-list">
              <li>Structured, research-informed learning</li>
              <li>Strong focus on language and thinking skills</li>
              <li>Calm, respectful classrooms</li>
              <li>Teaching that values understanding over memorization</li>
              <li>A school that prepares children for life—not just exams</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default SchoolPhilosophy;
