import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, FileText, Shield, ChevronDown } from 'lucide-react';
import './SupportPage.css';

const FAQ = [
  {
    q: "What is ClubHub?",
    a: "ClubHub is a centralized directory designed to help individuals discover, connect, and engage with social, cultural, and professional communities in Vijayawada."
  },
  {
    q: "How do I join a club?",
    a: "To join a club, simply explore our directory, select a community that aligns with your interests, and use the contact details or 'Join/Website' link provided on their dedicated profile page."
  },
  {
    q: "Is it free to use ClubHub?",
    a: "Yes! Browsing the directory, searching for clubs, and connecting with organizations is completely free for all users."
  },
  {
    q: "How do I register a new community?",
    a: "Click on the 'Register Club' button in the directory or use the 'Add Club' link in the dropdown menu. You'll need to be logged into your account to submit a new listing."
  },
  {
    q: "Are the club details verified?",
    a: "Yes, we manually verify the existence and primary contact details of each organization upon submission to ensure the highest quality and accuracy of listings."
  },
  {
    q: "How can I update my club's information?",
    a: "Currently, you can reach out to our support team at support@clubhub.vja to request updates. We are also rolling out a 'Club Dashboard' feature very soon for self-service updates."
  },
  {
    q: "Who can I contact for technical issues?",
    a: "For any bugs, feedback, or platform-related issues, please email our support team at support@clubhub.vja, and our technical team will assist you promptly."
  }
];

const SupportPage = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('help');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.hash === '#terms') setActiveSection('terms');
    else if (location.hash === '#privacy') setActiveSection('privacy');
    else setActiveSection('help');
  }, [location.hash]);

  const renderHelp = () => (
    <div className="support-content-section">
      <h2>Help Center</h2>
      <div className="faq-list">
        {FAQ.map((item, i) => (
          <button 
            key={i} 
            className={`faq-item ${openFaq === i ? 'open' : ''}`} 
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            aria-expanded={openFaq === i}
            style={{ width: '100%', textAlign: 'left', display: 'block' }}
          >
            <div className="faq-question">
              <span>{item.q}</span>
              <ChevronDown size={20} />
            </div>
            <div className="faq-answer">{item.a}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="support-content-section">
      <h2>Terms of Service</h2>
      <div className="legal-text">
        <p>By using ClubHub, you agree to the following terms...</p>
        <h3>1. Acceptance of Terms</h3>
        <p>ClubHub provides a directory service for communities in Vijayawada. By accessing our platform, you accept these terms in full.</p>
        <h3>2. User Responsibility</h3>
        <p>Users must provide accurate information when registering clubs. We reserve the right to remove any misleading or offensive content.</p>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="support-content-section">
      <h2>Privacy Policy</h2>
      <div className="legal-text">
        <p>Your privacy is important to us. This policy explains how we handle your data.</p>
        <h3>1. Data Collection</h3>
        <p>We collect basic profile information (name, email) for authentication and club details for the public directory.</p>
        <h3>2. Data Usage</h3>
        <p>Your personal data is never sold. Club details are made public as part of our core service to help users discover communities.</p>
      </div>
    </div>
  );

  return (
    <div className="container support-page">
      <div className="support-sidebar">
        <button 
          className={`sidebar-btn ${activeSection === 'help' ? 'active' : ''}`}
          onClick={() => setActiveSection('help')}
        >
          <HelpCircle size={20} /> <span>Help Center</span>
        </button>
        <button 
          className={`sidebar-btn ${activeSection === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveSection('terms')}
        >
          <FileText size={20} /> <span>Terms of Service</span>
        </button>
        <button 
          className={`sidebar-btn ${activeSection === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveSection('privacy')}
        >
          <Shield size={20} /> <span>Privacy Policy</span>
        </button>
      </div>

      <motion.div 
        key={activeSection}
        className="support-main"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {activeSection === 'help' && renderHelp()}
        {activeSection === 'terms' && renderTerms()}
        {activeSection === 'privacy' && renderPrivacy()}
      </motion.div>
    </div>
  );
};

export default SupportPage;
