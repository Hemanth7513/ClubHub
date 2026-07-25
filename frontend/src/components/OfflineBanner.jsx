import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mascotImg from '../assets/offline_mascot.png';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
            style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', justifyContent: 'center' }}
          >
            <img src={mascotImg} alt="Offline Mascot" style={{ width: '100%', objectFit: 'contain' }} />
            
            <div style={{
              position: 'absolute',
              top: '55%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#1a1a1a',
              textAlign: 'center',
              fontWeight: '800',
              width: '160px',
              fontSize: '18px',
              textTransform: 'uppercase',
              lineHeight: '1.2'
            }}>
              404<br/><span style={{fontSize: '12px'}}>WIFI NOT FOUND</span>
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '2rem', marginTop: '20px', color: 'var(--accent-lime)', textTransform: 'uppercase', fontWeight: 900 }}
          >
            <WifiOff size={32} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            You went offline
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ color: '#ccc', marginTop: '10px', fontSize: '1.1rem' }}
          >
            Waiting for network to reconnect...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
