/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, FileText, Shield, Info, CreditCard, ChevronDown, Mail, MapPin } from 'lucide-react';
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
    a: "Currently, you can reach out to our support team at support@clubhub.com to request updates. We are also rolling out a 'Club Dashboard' feature very soon for self-service updates."
  },
  {
    q: "Who can I contact for technical issues?",
    a: "For any bugs, feedback, or platform-related issues, please email our support team at support@clubhub.com, and our technical team will assist you promptly."
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
    else if (location.hash === '#refund') setActiveSection('refund');
    else if (location.hash === '#contact') setActiveSection('contact');
    else setActiveSection('help');
  }, [location.hash]);

  const renderHelp = () => (
    <div className="support-content-section">
      <h2>Help Center</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Find answers to frequently asked questions about the ClubHub directory and event pass platform.</p>
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
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Last updated: October 24, 2026</p>
        
        <h3>1. Acceptance of Agreement</h3>
        <p>By accessing or using the ClubHub platform (referred to as "the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
        
        <h3>2. Description of Service</h3>
        <p>ClubHub operates as a discovery portal and ticketing registry for local clubs, communities, and NGOs in Vijayawada, Andhra Pradesh. We reserve the right to modify or terminate any portion of the service without prior notice.</p>
        
        <h3>3. User Conduct & Content Submission</h3>
        <p>When registering organizations or creating events, you guarantee that all provided details (names, dates, contact links, images) are accurate and authentic. ClubHub reserves the right to suspend accounts or remove listings containing false, offensive, or misleading details.</p>
        
        <h3>4. Limitation of Liability</h3>
        <p>ClubHub holds no responsibility for the independent actions of listed clubs, nor for any occurrences, damages, or disputes arising during physical events organized by third-party communities.</p>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="support-content-section">
      <h2>Privacy Policy</h2>
      <div className="legal-text">
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Last updated: October 24, 2026</p>
        
        <h3>1. Information We Collect</h3>
        <p>To provide a secure experience, we collect basic registration data, including your name, email address, and encrypted passwords. For event ticket purchases, attendee details (name, email, and phone) are stored securely.</p>
        
        <h3>2. How We Use Information</h3>
        <p>We use your information strictly to authorize account access, process event registrations, and deliver booking passes. Your private contact details are never sold, traded, or shared with external marketing entities.</p>
        
        <h3>3. Security Measures</h3>
        <p>We employ standard encryption protocols to protect your personal information during transmission and storage. While we follow strict industry best practices, no digital storage method is 100% secure.</p>
      </div>
    </div>
  );

  const renderRefund = () => (
    <div className="support-content-section">
      <h2>Cancellation & Refund Policy</h2>
      <div className="legal-text">
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Last updated: October 24, 2026</p>
        
        <h3>1. Cancellation Terms</h3>
        <p>Cancellation requests for event tickets may be initiated up to 24 hours prior to the scheduled start of the respective event. Requests submitted within the 24-hour window before the event are not eligible for cancellations.</p>
        
        <h3>2. Refund Process</h3>
        <p>Once a cancellation request is approved, refunds are initiated back to the original payment source. Refund transactions typically reflect in your account within 5 to 7 business days, in compliance with bank settlement timelines.</p>
        
        <h3>3. Event Postponements & Cancellations</h3>
        <p>In the event that a host club cancels or reschedules an event, users will be notified immediately via email and will receive a full refund of their transaction amount.</p>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="support-content-section">
      <h2>Contact Us</h2>
      <div className="legal-text">
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Have questions, feedback, or need assistance? Reach out to our dedicated support team.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'var(--bg-lighter)', padding: '12px', borderRadius: '12px' }}>
              <Mail size={24} color="var(--accent-pink)" />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-main)' }}>Email Support</strong>
              <a href="mailto:support@clubhub.com" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>support@clubhub.com</a>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'var(--bg-lighter)', padding: '12px', borderRadius: '12px' }}>
              <MapPin size={24} color="var(--accent-pink)" />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-main)' }}>Address</strong>
              <span style={{ color: 'var(--text-light)' }}>Vijayawada, Andhra Pradesh, India</span>
            </div>
          </div>
        </div>
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
        <button 
          className={`sidebar-btn ${activeSection === 'refund' ? 'active' : ''}`}
          onClick={() => setActiveSection('refund')}
        >
          <CreditCard size={20} /> <span>Refund Policy</span>
        </button>
        <button 
          className={`sidebar-btn ${activeSection === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveSection('contact')}
        >
          <Info size={20} /> <span>Contact Us</span>
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
        {activeSection === 'refund' && renderRefund()}
        {activeSection === 'contact' && renderContact()}
      </motion.div>
    </div>
  );
};

export default SupportPage;

