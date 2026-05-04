import React from 'react';
import { Search, Filter } from 'lucide-react';
import './FilterBar.css';

const categories = [
  'All',
  'Social clubs',
  'Activity-based clubs',
  'Cultural and literary clubs',
  'Professional and networking groups',
  'Service organizations',
  'NGOs and volunteer groups',
  'Student and tech communities'
];

const FilterBar = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) => {
  return (
    <div className="filter-bar glass-panel animate-fade-in">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search clubs by name or keywords..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="category-filter-wrapper">
        <Filter className="filter-icon" size={20} />
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
