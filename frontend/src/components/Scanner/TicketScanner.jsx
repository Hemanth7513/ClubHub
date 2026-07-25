import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API_BASE_URL from '../../config';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, AlertOctagon } from 'lucide-react';
import './TicketScanner.css';

const TicketScanner = ({ eventId }) => {
  const { token } = useAuth();
  const [scanResult, setScanResult] = useState(null); // null, { status: 'success', data }, { status: 'error', message }
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let scanner = null;
    
    if (isScanning && !scanResult) {
      scanner = new Html5QrcodeScanner("reader", { 
        qrbox: { width: 250, height: 250 },
        fps: 5,
      }, false);

      scanner.render(async (decodedText) => {
        // Stop scanning temporarily
        scanner.pause(true);
        setIsScanning(false);
        
        try {
          // Send to backend
          const res = await fetch(`${API_BASE_URL}/events/${eventId}/check-in`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ registrationId: decodedText })
          });
          
          const data = await res.json();
          if (res.ok) {
            setScanResult({ status: 'success', data: data.registration });
          } else {
            setScanResult({ status: 'error', message: data.error || 'Invalid Ticket' });
          }
        } catch (err) {
          setScanResult({ status: 'error', message: 'Network error checking in.' });
        }
      }, (error) => {
        // Ignored, usually just means no QR code found yet
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error(e));
      }
    };
  }, [eventId, isScanning, scanResult, token]);

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="ticket-scanner-container glass-panel">
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--accent-lime)' }}>Ticket Scanner</h3>
      
      {!scanResult && (
        <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', border: '4px solid var(--border-dark)', borderRadius: '12px', overflow: 'hidden' }}></div>
      )}

      {scanResult && (
        <div className={`scan-result-card ${scanResult.status}`}>
          {scanResult.status === 'success' ? (
            <>
              <CheckCircle size={64} color="var(--accent-lime)" />
              <h2>VALID TICKET</h2>
              <p className="attendee-name">{scanResult.data.attendee_name}</p>
              <p>Ticket ID: {scanResult.data.id}</p>
            </>
          ) : (
            <>
              <AlertOctagon size={64} color="var(--accent-pink)" />
              <h2>INVALID TICKET</h2>
              <p>{scanResult.message}</p>
            </>
          )}
          
          <button className="brutalist-button mt-4" onClick={resetScanner} style={{ width: '100%' }}>
            Scan Next Ticket
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketScanner;
