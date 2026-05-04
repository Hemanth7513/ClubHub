import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, TrendingUp, Globe, Plus, Heart, ChevronDown } from 'lucide-react';
import ClubCard from '../components/ClubCard/ClubCard';
import SocialPulse from '../components/SocialPulse/SocialPulse';
import Marquee from '../components/Marquee/Marquee';
import Button from '../components/Button/Button';
import MissionPlot from '../components/MissionPlot/MissionPlot';
import DiscoveryWheel from '../components/DiscoveryWheel/DiscoveryWheel';
import StaggeredText from '../components/StaggeredText/StaggeredText';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import './DirectoryPage.css';

const CATEGORIES = [
  { name: 'Social & Recreation Clubs', icon: '🏛️', color: 'var(--accent-cyan)', desc: 'Elite social hubs and premium recreation centers.' },
  { name: 'Service Clubs', icon: '🤝', color: 'var(--accent-yellow)', desc: 'Community-driven service and leadership organizations.' },
  { name: 'NGOs & Social Organizations', icon: '🌱', color: 'var(--accent-lime)', desc: 'Dedicated to social welfare and sustainable impact.' },
  { name: 'Sports & Activity Clubs', icon: '🧗', color: 'var(--accent-pink)', desc: 'High-energy sports communities and fitness groups.' },
  { name: 'Cultural & Literary Clubs', icon: '📚', color: 'var(--accent-violet)', desc: 'Artistic expressions and intellectual gatherings.' },
  { name: 'Professional & Networking', icon: '🧑‍💼', color: 'var(--accent-orange)', desc: 'Career growth and elite professional circles.' },
  { name: 'Student & Tech Groups', icon: '💻', color: 'var(--accent-cyan)', desc: 'Next-gen innovation and student-led initiatives.' },
  { name: 'Nightlife & Entertainment', icon: '🌃', color: 'var(--accent-pink)', desc: 'The pulse of Vijayawada after dark.' }
];

const DirectoryPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/clubs`);
      if (!res.ok) throw new Error('Failed to fetch clubs');
      setClubs(await res.json());
      setError(null);
    } catch (err) {
      setError('Unable to load clubs.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDiscovery = () => {
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="directory-page">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Waking up the hubs...</p>
        </div>
      )}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div 
            key="landing-view" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="landing-view"
          >
            {/* REFINED HERO SECTION */}
            <section className="hero-refined">
              <div className="container hero-split">
                <motion.div 
                  className="hero-content"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="badge">VIJAYAWADA CLUB PORTAL</div>
                  <h1 className="title-xl">
                    <StaggeredText text="CITY" />
                    <span className="editorial-font italic">VOICE</span>
                  </h1>
                  <p className="hero-tagline">
                    The heart of community discovery. Connect with social, professional, and cultural circles that pulse with energy.
                  </p>
                  <div className="hero-cta">
                    <Button variant="primary" size="large">
                      Explore Hubs <ArrowRight size={20} />
                    </Button>
                  </div>
                </motion.div>

                <motion.div 
                  className="hero-visual"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <SocialPulse />
                </motion.div>
              </div>
            </section>

            {/* REFINED DISCOVERY PULSE */}
            <section className="discovery-pulse">
              <div className="container" style={{ position: 'relative' }}>
                <div className="discovery-header">
                  <h2 className="section-title">Explore Hubs</h2>
                  <p>Curated categories for every interest.</p>
                </div>
                
                <DiscoveryWheel 
                  categories={CATEGORIES} 
                  clubs={clubs} 
                  onSelect={setSelectedCategory} 
                />
              </div>
            </section>

            <MissionPlot />

            <section className="join-cta">
              <div className="container">
                <motion.div 
                  className="cta-minimal-panel"
                  whileInView={{ scale: [0.95, 1] }}
                  transition={{ duration: 0.8 }}
                >
                  <h2>Register Your Community</h2>
                  <p>Expand the network. Join Vijayawada's directory.</p>
                  <Link to="/add-club">
                    <Button variant="primary" className="btn-elevated">
                      <Plus size={20} /> Register Club
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div 
            key="category-view" 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="category-view"
          >
              <div className="category-view-content">
                <button className="back-btn" onClick={handleBackToDiscovery}>
                  <ArrowLeft size={18} /> BACK TO DISCOVERY
                </button>
                <div className="category-header">
                  <h1 className="title-xl">{selectedCategory}</h1>
                  <div className="category-accent-bar" style={{ background: CATEGORIES.find(c => c.name === selectedCategory)?.color }} />
                </div>
                <div className="clubs-grid">
                  {clubs.filter(c => c.category === selectedCategory).map((club, i) => (
                    <ClubCard key={club.id} club={club} index={i} />
                  ))}
                </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectoryPage;
