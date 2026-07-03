import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../Button/Button';
import API_BASE_URL from '../../config';
import { useAuth } from '../../context/AuthContext';
import './TicketModal.css';

const TicketModal = ({ isOpen, onClose, event }) => {
  const { token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [ticketData, setTicketData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // Registration Form State
  const [attendeeName, setAttendeeName] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [dietaryPref, setDietaryPref] = useState('');

  React.useEffect(() => {
    if (isOpen && event) {
      const fetchTicket = async () => {
        try {
          setFetchLoading(true);
          const res = await fetch(`${API_BASE_URL}/events/${event.id}/tickets`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setTicketData(data[0]);
            }
          }
        } catch (err) {
          console.error("Error fetching tickets:", err);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchTicket();
    }
  }, [isOpen, event]);

  const TICKET_PRICE = ticketData ? ticketData.price_inr : 0; 
  const PLATFORM_FEE_PERCENT = 0.05;
  const platformFee = TICKET_PRICE * quantity * PLATFORM_FEE_PERCENT;
  const totalAmount = (TICKET_PRICE * quantity) + platformFee;

  const handleCheckout = async () => {
    if (!attendeeName || !phone) {
      alert("Please fill in your Name and Phone Number.");
      return;
    }

    try {
      setLoading(true);
      setStatus('processing');
      
      const res = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticketId: ticketData.id,
          quantity,
          registration: {
            attendeeName,
            phone,
            collegeId,
            dietaryPref
          }
        })
      });

      if (!res.ok) throw new Error('Failed to initialize payment');
      const orderData = await res.json();

      const options = {
        key: 'rzp_test_clubhub123', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClubHub Events",
        description: `Tickets for ${event.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderData.dbOrderId,
                registration: {
                  attendeeName, phone, collegeId, dietaryPref, eventId: event.id
                }
              })
            });
            
            if (verifyRes.ok) {
              setStatus('success');
            } else {
              setStatus('error');
            }
          } catch (err) {
            setStatus('error');
          }
        },
        prefill: {
          name: attendeeName,
          email: "member@example.com",
          contact: phone
        },
        theme: {
          color: "#8b5cf6"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setStatus('error');
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div 
          className="ticket-modal glass-panel"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>

          {status === 'success' ? (
            <div className="modal-success">
              <CheckCircle size={64} color="var(--accent-green)" />
              <h2>Registration Complete!</h2>
              <p>Your tickets have been sent to your email.</p>
              <Button onClick={onClose} variant="primary" className="mt-4">Close</Button>
            </div>
          ) : status === 'error' ? (
            <div className="modal-error">
              <AlertTriangle size={64} color="var(--accent-pink)" />
              <h2>Registration Failed</h2>
              <p>Something went wrong during the transaction. Please try again.</p>
              <Button onClick={() => setStatus('idle')} variant="outline" className="mt-4">Retry</Button>
            </div>
          ) : (
            <>
              <h2>Secure Your Spot</h2>
              <h3 className="event-title-preview">{event.title}</h3>
              
              {fetchLoading ? (
                <p>Loading ticket info...</p>
              ) : !ticketData ? (
                <p>No tickets available for this event.</p>
              ) : (
                <>
                  <div className="ticket-selector">
                    <p className="selector-label">{ticketData.name}</p>
                    <p className="text-sm" style={{color: 'var(--text-light)', marginBottom: '1rem'}}>
                       {ticketData.capacity - ticketData.sold} left
                    </p>
                    <div className="quantity-controls">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={loading}>-</button>
                      <span className="qty-display">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(10, Math.min(quantity + 1, ticketData.capacity - ticketData.sold)))} disabled={loading}>+</button>
                    </div>
                  </div>

                  <div className="registration-form" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Attendee Details</h4>
                    <input 
                      type="text" 
                      placeholder="Full Name *" 
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="auth-input"
                      required
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number *" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="auth-input"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="College / Organization ID (Optional)" 
                      value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                      className="auth-input"
                    />
                    <input 
                      type="text" 
                      placeholder="Dietary Preferences (Optional)" 
                      value={dietaryPref}
                      onChange={(e) => setDietaryPref(e.target.value)}
                      className="auth-input"
                    />
                  </div>

                  <div className="price-breakdown" style={{ marginTop: '1.5rem' }}>
                    <div className="breakdown-row">
                      <span>Tickets ({quantity} x ₹{TICKET_PRICE})</span>
                      <span>₹{TICKET_PRICE * quantity}</span>
                    </div>
                    <div className="breakdown-row fee-row">
                      <span>Platform Fee (5%)</span>
                      <span>₹{platformFee.toFixed(2)}</span>
                    </div>
                    <hr className="divider" />
                    <div className="breakdown-row total-row">
                      <span>Total Amount</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    size="large" 
                    className="w-full checkout-btn"
                    onClick={handleCheckout}
                    disabled={loading || ticketData.sold >= ticketData.capacity}
                    style={{ marginTop: '1.5rem' }}
                  >
                    {loading ? 'Processing...' : (ticketData.sold >= ticketData.capacity ? 'Sold Out' : `Pay ₹${totalAmount.toFixed(2)}`)}
                  </Button>
                </>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TicketModal;
