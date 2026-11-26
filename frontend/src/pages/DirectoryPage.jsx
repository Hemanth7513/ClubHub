import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, GlassWater, Trophy, Users, Globe2, Briefcase, Landmark, BookOpen, Laptop, BadgeCheck } from 'lucide-react';
import ClubCard from '../components/ClubCard/ClubCard';
import Button from '../components/Button/Button';
import MissionPlot from '../components/MissionPlot/MissionPlot';
import DiscoveryWheel from '../components/DiscoveryWheel/DiscoveryWheel';
import SearchBar from '../components/SearchBar/SearchBar';
import { Link, useLocation } from 'react-router-dom';
import Fuse from 'fuse.js';
import API_BASE_URL from '../config';
import SkeletonCard from '../components/Loaders/SkeletonCard';
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
  const [clubs, setClubs] = useState(() => {
    try {
      const cached = localStorage.getItem('clubsCache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('clubsCache'));
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('az'); // 'az' | 'newest'
  const [visibleCount, setVisibleCount] = useState(9);
  const CLUBS_PER_PAGE = 9;
  

  const discoveryRef = useRef(null);


  const location = useLocation();

  const scrollToDiscovery = () => {
    discoveryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchClubs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/clubs`);
      if (!res.ok) throw new Error('Failed to fetch clubs');
      const data = await res.json();
      setClubs(data);
      localStorage.setItem('clubsCache', JSON.stringify(data));
      setError(null);
    } catch {
      if (!localStorage.getItem('clubsCache')) setError('Unable to load clubs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  useEffect(() => {
    if (location.hash === '#categories' && !loading) {
      setTimeout(scrollToDiscovery, 100);
    } else if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.hash, loading]);

  const handleBackToDiscovery = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setTimeout(() => {
      scrollToDiscovery();
    }, 100);
  };

  const filteredClubs = useMemo(() => {
    let result = clubs;

    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (verifiedOnly) {
      result = result.filter(c => Boolean(c.isVerified ?? c.is_verified));
    }

    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ['name', 'category', 'description'],
        threshold: 0.3,
        ignoreLocation: true
      });
      result = fuse.search(searchQuery).map(res => res.item);
    }

    const sorted = [...result];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
    } else {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return sorted;
  }, [clubs, selectedCategory, verifiedOnly, searchQuery, sortBy]);

  const displayedClubs = filteredClubs.slice(0, visibleCount);

  const handleResetFilters = () => {
    setVerifiedOnly(false);
    setSortBy('az');
    setSearchQuery('');
  };

  const renderFilterToolbar = (layoutPrefix) => (
    <div className="directory-filter-toolbar">
      <div className="filter-pills-group" role="group" aria-label="Sort and filter hubs">
        {[
          { id: 'az', label: 'A–Z' },
          { id: 'newest', label: 'Newest' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`filter-pill ${sortBy === opt.id ? 'is-active' : ''}`}
            onClick={() => setSortBy(opt.id)}
          >
            {sortBy === opt.id && (
              <motion.span
                layoutId={`activeSortPill-${layoutPrefix}`}
                className="filter-pill-bg"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="filter-pill-label">{opt.label}</span>
          </button>
        ))}

        <button
          type="button"
          className={`filter-pill ${verifiedOnly ? 'is-active is-verified' : ''}`}
          onClick={() => setVerifiedOnly(v => !v)}
          aria-pressed={verifiedOnly}
        >
          <span className="filter-pill-label">
            <BadgeCheck size={14} /> Verified Only
          </span>
        </button>
      </div>

      <span className="filter-count-badge">
        Showing {displayedClubs.length} of {filteredClubs.length} hubs
      </span>
    </div>
  );

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + CLUBS_PER_PAGE);
  };

  return (
    <div className="directory-page">

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
            <section className="hero-refined section-padding">
              <div className="hero-orb"></div>
              <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <motion.div 
                  className="hero-content-centered"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1, 
                      transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
                    }
                  }}
                >
                  <motion.h1 
                    className="title-xl hero-title"
                    variants={{
                      hidden: { y: 40, opacity: 0 },
                      visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
                    }}
                  >
                    Find Your Perfect <br/>
                    <span className="editorial-font italic hero-highlight">Community</span>
                  </motion.h1>

                  <motion.p 
                    className="hero-tagline"
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
                    }}
                  >
                    Explore verified social, professional, and cultural clubs across the city. Connect with the people who share your passion.
                  </motion.p>
                  
                  <motion.div 
                    className="hero-cta"
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
                    }}
                  >
                    <Button variant="primary" size="large" onClick={scrollToDiscovery} className="btn-primary-hero">
                      Start Exploring <ArrowRight size={20} />
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            <section className="discovery-section" ref={discoveryRef}>
              <div className="container" style={{ position: 'relative' }}>
                <div className="discovery-header">
                  <h2 className="section-title">Explore Hubs</h2>
                  <p>Curated categories for every interest.</p>
                </div>

                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                
                {loading ? (
                  <div className="clubs-grid stagger-in mt-4">
                    {[...Array(6)].map((_, i) => (
                      <SkeletonCard key={`skeleton-${i}`} index={i} />
                    ))}
                  </div>
                ) : searchQuery ? (
                  <>
                    {renderFilterToolbar('search')}
                    <motion.div layout className="clubs-grid mt-4">
                      <AnimatePresence mode="popLayout">
                        {displayedClubs.length > 0 ? displayedClubs.map((club, i) => (
                          <ClubCard key={club.id} club={club} index={i} />
                        )) : (
                          <motion.div
                            key="empty-search"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="empty-filter-state"
                          >
                            <h3>No matches found</h3>
                            <p>Try a different search term or reset your active filters.</p>
                            <Button variant="outline" onClick={handleResetFilters}>Reset Filters</Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    {filteredClubs.length > visibleCount && (
                      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Button variant="outline" onClick={handleLoadMore}>Load More Results</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <DiscoveryWheel 
                    categories={CATEGORIES} 
                    clubs={clubs} 
                    onSelect={(cat) => {
                      setSelectedCategory(cat);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
                {renderFilterToolbar('category')}
                <motion.div layout className="clubs-grid">
                  <AnimatePresence mode="popLayout">
                    {displayedClubs.length > 0 ? displayedClubs.map((club, i) => (
                      <ClubCard key={club.id} club={club} index={i} />
                    )) : (
                      <motion.div
                        key="empty-category"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="empty-filter-state"
                      >
                        <h3>No matching hubs</h3>
                        <p>No clubs match your current filter in this category.</p>
                        <Button variant="outline" onClick={handleResetFilters}>Reset Filters</Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                {filteredClubs.length > visibleCount && (
                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Button variant="outline" onClick={handleLoadMore}>Load More Clubs</Button>
                  </div>
                )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectoryPage;
