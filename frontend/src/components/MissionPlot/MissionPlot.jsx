import React from 'react';
import { motion } from 'framer-motion';
import './MissionPlot.css';

const MissionPlot = () => {
  return (
    <section className="mission-plot">
      <div className="container">
        <motion.div 
          className="plot-card"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="plot-header">
            <span className="label">The Vision</span>
            <h2 className="text-gradient">Connecting Vijayawada</h2>
          </div>
          <div className="plot-content">
            <p className="highlight">
              ClubHub isn't just a directory. It's the digital heartbeat of our city's social fabric.
            </p>
            <p>
              In a rapidly evolving Vijayawada, community matters more than ever. Whether you're an athlete, a socialite, a professional, or a student, we map the spaces where people meet, grow, and create.
            </p>
            <div className="plot-stats">
              <div className="stat">
                <span className="number">47+</span>
                <span className="stat-label">Verified Clubs</span>
              </div>
              <div className="stat">
                <span className="number">8</span>
                <span className="stat-label">Categories</span>
              </div>
              <div className="stat">
                <span className="number">1</span>
                <span className="stat-label">Unity</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MissionPlot;
