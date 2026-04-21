/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Booking Routes
   POST /api/booking — Save booking details
   GET  /api/slots   — Deprecated endpoint (kept for compatibility)
   ═══════════════════════════════════════════════════════════ */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BOOKINGS_FILE = path.join(__dirname, '..', 'bookings.json');

function getBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf8');
    }

    const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
}

function resolveContactName(payload, details) {
  if (payload.contactName) return String(payload.contactName).trim();
  if (payload.name) return String(payload.name).trim();

  if (details.fullName) return String(details.fullName).trim();
  if (details.contactPersonName) return String(details.contactPersonName).trim();
  if (details.name) return String(details.name).trim();

  const pairName = [details.boyName, details.girlName].filter(Boolean).join(' & ').trim();
  if (pairName) return pairName;

  return '';
}

function resolveContactPhone(payload, details) {
  if (payload.contactPhone) return String(payload.contactPhone).trim();
  if (payload.phone) return String(payload.phone).trim();

  if (details.phone) return String(details.phone).trim();
  if (details.phoneNumber) return String(details.phoneNumber).trim();
  if (details.contactNumber) return String(details.contactNumber).trim();

  return '';
}

router.post('/booking', (req, res) => {
  const payload = req.body || {};
  const details = payload.details && typeof payload.details === 'object' ? payload.details : {};

  const contactName = resolveContactName(payload, details);
  const contactPhone = resolveContactPhone(payload, details);

  if (!payload.service || !payload.date || !contactName || !contactPhone) {
    return res.status(400).json({
      error: 'Missing required booking fields: service, date, contactName, contactPhone.'
    });
  }

  const booking = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    service: payload.service,
    price: Number(payload.price) || 0,
    date: payload.date,
    paymentId: payload.paymentId || '',
    contactName,
    contactPhone,
    selectedPujan: payload.selectedPujan || '',
    details,

    // Backward-compatible fields preserved for older consumers.
    name: contactName,
    phone: contactPhone,
    dob: payload.dob || details.dob || details.boyDob || '',
    tob: payload.tob || details.tob || details.boyTob || '',
    pob: payload.pob || details.pob || details.boyPob || '',
    slot: payload.slot || '',

    createdAt: new Date().toISOString()
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  console.log(`✦ New booking: ${booking.contactName} — ${booking.service} on ${booking.date}`);

  return res.json({ success: true, bookingId: booking.id });
});

router.get('/slots', (req, res) => {
  const { date } = req.query;

  // Deprecated endpoint: frontend no longer uses time slots.
  return res.json({
    date: date || '',
    allSlots: [],
    bookedSlots: [],
    availableSlots: []
  });
});

module.exports = router;
