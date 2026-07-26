const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateEventInput } = require('../middleware/validationMiddleware');

const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 120 });

const { Resend } = require('resend');
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const QRCode = require('qrcode');

// Get all events
router.get('/', async (req, res) => {
    try {
        const cachedData = myCache.get('events_all');
        if (cachedData) return res.json(cachedData);

        const { data, error } = await supabase
            .from('events')
            .select('*, clubs(name), tickets(id, name, price_inr, capacity, sold)')
            .order('date', { ascending: true });
        
        if (error) throw error;
        myCache.set('events_all', data);
        res.json(data);
    } catch (err) {
        console.error('Fetch events error:', err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*, clubs(id, name)')
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Event not found' });
        res.json(data);
    } catch (err) {
        console.error('Fetch single event error:', err);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Get tickets for an event
router.get('/:id/tickets', async (req, res) => {
    try {
        const cacheKey = `tickets_${req.params.id}`;
        const cachedData = myCache.get(cacheKey);
        if (cachedData) return res.json(cachedData);

        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('event_id', req.params.id);
        
        if (error) throw error;
        myCache.set(cacheKey, data);
        res.json(data);
    } catch (err) {
        console.error('Fetch tickets error:', err);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// Create a new event
router.post('/', authenticateToken, validateEventInput, async (req, res) => {
    const { clubId, title, description, date, location, imageUrl, category } = req.body;
    try {
        // Verify club ownership before adding an event
        const { data: club, error: clubFetchError } = await supabase
            .from('clubs')
            .select('user_id')
            .eq('id', clubId)
            .single();

        if (clubFetchError || !club) return res.status(404).json({ error: 'Club not found' });
        if ((!club.user_id || club.user_id.toString() !== req.user.id.toString()) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to add events to this club' });
        }

        const { data, error } = await supabase
            .from('events')
            .insert([{
                club_id: clubId, title, description, date, location, 
                image_url: imageUrl, category,
                user_id: req.user.id
            }])
            .select();
        
        if (error) throw error;
        myCache.flushAll();
        res.status(201).json(data[0]);
    } catch (err) {
        console.error('Create event error:', err);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Create a ticket for an event (owner only)
router.post('/:id/tickets', authenticateToken, async (req, res) => {
    try {
        const { name, price_inr, capacity } = req.body;
        if (!name) return res.status(400).json({ error: 'Ticket name is required' });

        // Verify event ownership before creating tickets
        const { data: event, error: eventFetchError } = await supabase
            .from('events')
            .select('user_id')
            .eq('id', req.params.id)
            .single();

        if (eventFetchError || !event) return res.status(404).json({ error: 'Event not found' });
        if ((!event.user_id || event.user_id.toString() !== req.user.id.toString()) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to create tickets for this event' });
        }

        const { data, error } = await supabase
            .from('tickets')
            .insert([{
                event_id: req.params.id,
                name,
                price_inr: parseFloat(price_inr) || 0,
                capacity: parseInt(capacity) || 100,
                sold: 0
            }])
            .select()
            .single();

        if (error) throw error;
        myCache.del(`tickets_${req.params.id}`);
        res.status(201).json(data);
    } catch (err) {
        console.error('Create ticket error:', err);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// Update event (protected, owner only)
router.put('/:id', authenticateToken, validateEventInput, async (req, res) => {
    try {
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('user_id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !event) return res.status(404).json({ error: 'Event not found' });

        if ((!event.user_id || event.user_id.toString() !== req.user.id.toString()) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to edit this event' });
        }

        const { clubId, title, description, date, location, imageUrl, category } = req.body;

        const { data, error } = await supabase
            .from('events')
            .update({
                club_id: clubId, title, description, date, location,
                image_url: imageUrl, category
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        myCache.flushAll();
        res.json(data);
    } catch (err) {
        console.error('Edit event error:', err);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event (protected, owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('user_id')
            .eq('id', req.params.id)
            .single();
            
        if (fetchError || !event) return res.status(404).json({ error: 'Event not found' });
        
        if ((!event.user_id || event.user_id.toString() !== req.user.id.toString()) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to delete this event' });
        }
        
        const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .eq('id', req.params.id);
            
        if (deleteError) throw deleteError;
        myCache.flushAll();
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error("Delete event error:", err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// RSVP to an event (Claim a ticket)
router.post('/:id/rsvp', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        const { ticketId, attendeeName, phone } = req.body;

        if (!ticketId || !attendeeName || !phone) {
            return res.status(400).json({ error: 'Ticket ID, Name, and Phone are required.' });
        }

        // 1. Check if ticket exists (RPC function handles capacity check atomically later, but we can do a quick fail-fast check here)
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.sold >= ticket.capacity) return res.status(400).json({ error: 'This ticket type is sold out!' });

        // 2. Check if user already RSVP'd to this event
        const { data: existing, error: existError } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ error: 'You have already RSVP\'d to this event!' });
        }

        // 3. Create the registration
        const { data: registration, error: regError } = await supabase
            .from('event_registrations')
            .insert([{
                event_id: eventId,
                user_id: userId,
                attendee_name: attendeeName,
                phone: phone
            }])
            .select()
            .single();
            
        if (regError) throw regError;

        // 4. Atomically increment ticket sold count using RPC
        const { data: updatedTicket, error: incrementError } = await supabase.rpc('increment_ticket_sold', {
            p_ticket_id: ticketId
        });

        if (incrementError || !updatedTicket || updatedTicket.length === 0) {
            // Rollback registration since ticket is sold out
            await supabase.from('event_registrations').delete().eq('id', registration.id);
            return res.status(400).json({ error: 'Sorry, this ticket type just sold out!' });
        }

        myCache.del(`tickets_${eventId}`);

        // 5. Send automated confirmation email asynchronously
        if (process.env.RESEND_API_KEY && req.user.email) {
            // Fetch event details for the email
            const { data: eventData } = await supabase
                .from('events')
                .select('title, date, location, clubs(name)')
                .eq('id', eventId)
                .single();

            const clubName = eventData?.clubs?.name || 'ClubHub';
            const eventTitle = eventData?.title || 'Your Event';
            const eventDate = eventData?.date ? new Date(eventData.date).toLocaleString() : 'TBA';
            
            // Generate QR Code from the Registration ID
            let qrCodeDataUrl = '';
            try {
                qrCodeDataUrl = await QRCode.toDataURL(registration.id.toString(), {
                    color: { dark: '#000000', light: '#ccff00' },
                    margin: 2
                });
            } catch (err) {
                console.error('QR Gen error:', err);
            }

            if (resend) {
                resend.emails.send({
                    from: 'ClubHub <onboarding@resend.dev>',
                    to: req.user.email,
                    subject: `🎟️ Your Ticket: ${eventTitle}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border: 4px solid #ccff00; border-radius: 8px;">
                            <h1 style="color: #ccff00; text-transform: uppercase;">You're In!</h1>
                            <p style="font-size: 16px;">Hi ${attendeeName},</p>
                            <p style="font-size: 16px;">Your RSVP for <strong>${eventTitle}</strong> hosted by <strong>${clubName}</strong> is confirmed.</p>
                            
                            ${qrCodeDataUrl ? `
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="color: #ccff00; font-weight: bold; margin-bottom: 10px;">SCAN THIS AT THE DOOR</p>
                                <img src="${qrCodeDataUrl}" alt="Ticket QR Code" style="border: 4px solid #fff; border-radius: 8px; width: 200px; height: 200px;" />
                                <p style="color: #888; font-size: 12px; margin-top: 10px;">Ticket ID: ${registration.id}</p>
                            </div>
                            ` : ''}

                            <div style="background: #1a1a1a; padding: 15px; margin: 20px 0; border-left: 4px solid #ff2e63;">
                                <p style="margin: 5px 0;"><strong>Ticket Type:</strong> ${ticket.name}</p>
                                <p style="margin: 5px 0;"><strong>Date:</strong> ${eventDate}</p>
                                <p style="margin: 5px 0;"><strong>Location:</strong> ${eventData?.location || 'TBA'}</p>
                            </div>
                            <p style="font-size: 14px; color: #888;">Present this email at the entrance. See you there!</p>
                            <p style="font-size: 14px; color: #888;">- The ClubHub Team</p>
                        </div>
                    `
                }).catch(err => console.error('Failed to send RSVP email:', err));
            }
        }

        res.status(201).json({ message: 'RSVP successful!', registration });
    } catch (err) {
        console.error('RSVP error:', err);
        res.status(500).json({ error: 'Failed to process RSVP' });
    }
});

// Check-In (Verify Ticket)
router.post('/:id/check-in', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const { registrationId } = req.body;
        
        if (!registrationId) return res.status(400).json({ error: 'Registration ID required' });

        // 1. Ensure the user calling this owns the event
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('user_id')
            .eq('id', eventId)
            .single();

        if (eventError || !event) return res.status(404).json({ error: 'Event not found' });
        if (event.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized to scan tickets for this event' });

        // 2. Look up the registration
        const { data: registration, error: regError } = await supabase
            .from('event_registrations')
            .select('*, users(email)')
            .eq('id', registrationId)
            .eq('event_id', eventId)
            .single();

        if (regError || !registration) {
            return res.status(404).json({ error: 'Invalid Ticket! Registration not found for this event.' });
        }

        if (registration.checked_in) {
            return res.status(400).json({ error: 'Ticket Already Scanned! This ticket has already been used for entry.' });
        }

        // 3. Update checked_in status
        const { error: updateError } = await supabase
            .from('event_registrations')
            .update({ checked_in: true })
            .eq('id', registrationId);

        if (updateError) throw updateError;
        
        res.json({ 
            message: 'Ticket Validated!', 
            registration,
            status: 'success'
        });

    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Failed to verify ticket' });
    }
});

module.exports = router;
