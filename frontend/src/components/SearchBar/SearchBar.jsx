import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <motion.div 
      className={`search-container ${isFocused ? 'focused' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="search-input-wrapper glass-panel">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search communities, categories, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="clear-search-btn"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SearchBar;
