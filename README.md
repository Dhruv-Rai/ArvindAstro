# Arvind Rai — Vedic Astrologer Website

A production-ready website for **Arvind Rai**, Vedic Astrologer based in Varanasi, Uttar Pradesh Pradesh.

## Features

- **Booking System** — Service-card-first 4-step booking flow (Details -> Date -> Confirmation -> Payment)
- **PhonePe Payments** — OAuth-based PhonePe Standard Checkout v2 (auth token -> create payment -> PayPage -> status verify)
- **6 Astrology Calculators** — Numerology, Moon Sign, Love Compatibility, Dasha, Kundali (placeholder), Panchang
- **Contact Form** — EmailJS + backend Nodemailer dual delivery
- **WhatsApp Direct Links** — One-click chat with the astrologer
- **Responsive Design** — Mobile-first with hamburger navigation
- **Panchang Widget** — Daily Tithi, Nakshatra, Yoga on the homepage

## Project Structure

```
arvindrai/
├── index.html              # Main website (single page)
├── css/style.css           # All styles
├── js/
│   ├── main.js             # Navigation, FAQ, scroll spy, EmailJS
│   ├── booking.js          # Service-driven booking modal controller (4-step)
│   ├── calculator.js       # 6 astrology calculators
│   └── payment.js          # PhonePe frontend helper
├── backend/
│   ├── server.js           # Express server entry point
│   ├── package.json        # Node dependencies
│   └── routes/
│       ├── booking.js      # POST /api/booking, GET /api/slots
│       ├── contact.js      # POST /api/contact
│       └── payment.js      # PhonePe initiate/status/callback routes
├── images/
│   └── README.md           # Image placement guide (17 slots)
└── README.md               # This file
```

## Quick Start

### 1. Add Images
See `images/README.md` for the 17 image slots. Place your images in the `images/` folder with the filenames listed there.

### 2. Configure Environment Variables
```bash
cd backend
copy .env.example .env
```
If `.env.example` is not present, create `.env` manually.

Edit `.env` and add your:
- **PhonePe Standard Checkout v2** credentials:
	- `PHONEPE_CLIENT_ID` (or fallback alias `client_id`)
	- `PHONEPE_CLIENT_SECRET` (or fallback alias `client_secret`)
	- `PHONEPE_CLIENT_VERSION` (default `1`)
	- `PHONEPE_GRANT_TYPE` (default `client_credentials`)
	- `PHONEPE_MODE` (`production` or `sandbox`, optional)
	- `PHONEPE_REDIRECT_BASE_URL` (optional; recommended behind proxy/load balancer)
	- Optional endpoint overrides: `PHONEPE_AUTH_URL`, `PHONEPE_PAY_URL`, `PHONEPE_ORDER_STATUS_BASE_URL`
- **Prokerala OAuth** credentials (for astrology/numerology routes):
	- `CLIENT_ID`
	- `CLIENT_SECRET`
- **EmailJS** credentials (from [emailjs.com](https://emailjs.com))
- **WhatsApp** number
- (Optional) SMTP email credentials for Nodemailer

### 3. Update Frontend Config
In `js/main.js`, update:
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`
- `WHATSAPP_NUMBER`

In `index.html`, replace all `91XXXXXXXXXX` in WhatsApp links with the actual number.

### 4. Install & Run Backend
```bash
cd backend
npm install
npm run dev    # Development (auto-restart with nodemon)
# or
npm start      # Production
```

If PowerShell blocks `npm` scripts (`npm.ps1` execution policy), run `npm.cmd` instead.

### 5. Open the Website
Open `index.html` in a browser, or run the project with your local dev server setup.

## Services & Pricing

| Service | Price |
|---------|-------|
| Janam Kundali | ₹1,499 |
| Kundali Milan | ₹1,999 |
| Industrial/Commercial Vastu | ₹1,799 |
| Vastu Shastra | ₹2,499 |
| Gemstone Consultation | ₹1,299 |
| Pujan / Remedies | ₹1,499 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/slots?date=YYYY-MM-DD` | Available time slots |
| POST | `/api/booking` | Save a booking |
| POST | `/api/contact` | Contact form submission |
| POST | `/api/payment/phonepe/initiate` | Initiate PhonePe payment and get redirect URL |
| GET | `/api/payment/phonepe/status/:transactionId` | Fetch PhonePe transaction status |
| POST | `/api/payment/phonepe/callback` | PhonePe callback acknowledgement endpoint |
| POST | `/api/verify-payment` | Legacy endpoint (returns migration error) |

## Future Upgrades

Marked with `<!-- API UPGRADE -->` comments in the code:
- **Kundali Generator** — Integrate Vedic Rishi API or Astro-Seek API
- **Live Panchang** — Integrate Drik Panchang API
- **Accurate Moon Sign** — Use Swiss Ephemeris for precise calculations
- **Vimshottari Dasha** — Full ephemeris-based Dasha calculation
