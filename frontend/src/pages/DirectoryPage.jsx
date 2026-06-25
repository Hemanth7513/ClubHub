import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, GlassWater, Trophy, Users, Globe2, Briefcase, Landmark, BookOpen, Laptop } from 'lucide-react';
import ClubCard from '../components/ClubCard/ClubCard';
import Button from '../components/Button/Button';
import MissionPlot from '../components/MissionPlot/MissionPlot';
import DiscoveryWheel from '../components/DiscoveryWheel/DiscoveryWheel';
import StaggeredText from '../components/StaggeredText/StaggeredText';
import { Link, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import './DirectoryPage.css';

const CATEGORIES = [
  { name: 'Social & Recreation Clubs', icon: <Landmark size={28} />, color: 'var(--accent-cyan)', desc: 'Elite social hubs and premium recreation centers.' },
  { name: 'Service Clubs', icon: <Users size={28} />, color: 'var(--accent-yellow)', desc: 'Community-driven service and leadership organizations.' },
  { name: 'NGOs & Social Organizations', icon: <Globe2 size={28} />, color: 'var(--accent-lime)', desc: 'Dedicated to social welfare and sustainable impact.' },
  { name: 'Sports & Activity Clubs', icon: <Trophy size={28} />, color: 'var(--accent-pink)', desc: 'High-energy sports communities and fitness groups.' },
  { name: 'Cultural & Literary Clubs', icon: <BookOpen size={28} />, color: 'var(--accent-violet)', desc: 'Artistic expressions and intellectual gatherings.' },
  { name: 'Professional & Networking', icon: <Briefcase size={28} />, color: 'var(--accent-orange)', desc: 'Career growth and elite professional circles.' },
  { name: 'Student & Tech Groups', icon: <Laptop size={28} />, color: 'var(--accent-cyan)', desc: 'Next-gen innovation and student-led initiatives.' },
  { name: 'Nightlife & Entertainment', icon: <GlassWater size={28} />, color: 'var(--accent-pink)', desc: 'The pulse of Vijayawada after dark.' }
];

const DirectoryPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Only show the splash screen once per session
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splash_shown'));
  
  const discoveryRef = useRef(null);


  const location = useLocation();

  const scrollToDiscovery = () => {
    discoveryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { 
    fetchClubs(); 
  }, []);

  useEffect(() => {
    if (location.hash === '#categories' && !loading) {
      setTimeout(scrollToDiscovery, 100);
    } else if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.hash, loading]);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('splash_shown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

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
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            className="splash-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="splash-content">
              <motion.div 
                className="splash-logo"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <span className="city">VIJAYAWADA</span>
                <span className="brand">CITY<br/>VOICE</span>
              </motion.div>

              <motion.div
                className="splash-accent-line"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
              
              <div className="splash-loader-bar">
                <div className="splash-loader-progress"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <div className="error-overlay">
          <p>{error}</p>
          <Button onClick={fetchClubs}>Retry Connection</Button>
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
            <section className="hero-refined">
              <div className="container">
                <motion.div 
                  className="hero-content-centered"
                  initial={{ y: 50, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="title-xl">
                    <StaggeredText text="CITY" />
                    <span className="editorial-font italic">VOICE</span>
                  </h1>
                  <p className="hero-tagline">
                    The heart of community discovery. Connect with social, professional, and cultural circles that pulse with energy.
                  </p>
                  <div className="hero-cta">
                    <Button variant="primary" size="large" onClick={scrollToDiscovery}>
                      Explore Hubs <ArrowRight size={20} />
                    </Button>
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="discovery-section" ref={discoveryRef}>
              <div className="container" style={{ position: 'relative' }}>
                <div className="discovery-header">
                  <h2 className="section-title">Explore Hubs</h2>
                  <p>Curated categories for every interest.</p>
                </div>
                
                {loading && !showSplash ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <DiscoveryWheel 
                    categories={CATEGORIES} 
                    clubs={clubs} 
                    onSelect={setSelectedCategory} 
                  />
                )}
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
