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

  React.useEffect(() => {
    if (isOpen && event) {
      const fetchTicket = async () => {
        try {
          setFetchLoading(true);
          const res = await fetch(`${API_BASE_URL}/events/${event.id}/tickets`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setTicketData(data[0]); // Just pick the first ticket tier for now
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
    try {
      setLoading(true);
      setStatus('processing');
      
      // 1. Create Order on Backend
      const res = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticketId: ticketData.id,
          quantity
        })
      });

      if (!res.ok) throw new Error('Failed to initialize payment');
      const orderData = await res.json();

      // 2. Initialize Razorpay Checkout
      const options = {
        key: 'rzp_test_clubhub123', // Replace with real test key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClubHub Events",
        description: `Tickets for ${event.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // 3. Verify Payment
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
                dbOrderId: orderData.dbOrderId
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
          name: "Club Member",
          email: "member@example.com",
          contact: "9999999999"
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
              <h2>Payment Successful!</h2>
              <p>Your tickets have been sent to your email.</p>
              <Button onClick={onClose} variant="primary" className="mt-4">Close</Button>
            </div>
          ) : status === 'error' ? (
            <div className="modal-error">
              <AlertTriangle size={64} color="var(--accent-pink)" />
              <h2>Payment Failed</h2>
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

                  <div className="price-breakdown">
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
