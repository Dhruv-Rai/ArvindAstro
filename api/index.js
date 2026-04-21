/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Backend Server
  Express server with CORS and API routes
   ═══════════════════════════════════════════════════════════ */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();

const PHONEPE_PRODUCTION_AUTH_URL = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
const PHONEPE_PRODUCTION_PAY_URL = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
const PHONEPE_PRODUCTION_STATUS_BASE_URL = 'https://api.phonepe.com/apis/pg/checkout/v2/order';
const PAYMENT_REDIRECT_BASE_URL = 'https://arvindrai.in';
const PAYMENT_CALLBACK_URL = 'https://arvindrai.in/api/payment/phonepe/callback';

const paymentAuthState = {
  accessToken: '',
  tokenType: 'O-Bearer',
  expiresAtMs: 0
};

let paymentAuthRefreshPromise = null;

function getPaymentConfig() {
  const expireAfterRaw = Number(process.env.PAYMENT_EXPIRE_AFTER_SECONDS || 1200);
  const expireAfterSeconds = Number.isFinite(expireAfterRaw)
    ? Math.min(3600, Math.max(300, Math.round(expireAfterRaw)))
    : 1200;

  const clientId = String(
    process.env.PAYMENT_CLIENT_ID
    || process.env.PHONEPE_CLIENT_ID
    || process.env.client_id
    || ''
  ).trim();

  const clientSecret = String(
    process.env.PAYMENT_CLIENT_SECRET
    || process.env.PHONEPE_CLIENT_SECRET
    || process.env.client_secret
    || process.env.CLIENT_SECRET
    || ''
  ).trim();

  const clientVersion = String(
    process.env.PAYMENT_CLIENT_VERSION
    || process.env.PHONEPE_CLIENT_VERSION
    || process.env.client_version
    || '1'
  ).trim() || '1';

  const grantType = String(
    process.env.PAYMENT_GRANT_TYPE
    || process.env.PHONEPE_GRANT_TYPE
    || process.env.grant_type
    || 'client_credentials'
  ).trim() || 'client_credentials';

  return {
    clientId: clientId,
    clientSecret: clientSecret,
    clientVersion: clientVersion,
    grantType: grantType,
    expireAfterSeconds: expireAfterSeconds
  };
}

function isPaymentConfigured(config) {
  return Boolean(config.clientId && config.clientSecret);
}

function sanitizePhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 10) {
    return '';
  }

  return digits.slice(-10);
}

function buildMerchantOrderId(reference) {
  const cleanedReference = String(reference || 'booking')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 35) || 'booking';

  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const orderId = cleanedReference + '-' + Date.now() + '-' + randomSuffix;
  return orderId.slice(0, 63);
}

function buildPaymentMeta(payload) {
  return {
    udf1: String(payload.service || '').slice(0, 256),
    udf2: String(payload.bookingReference || '').slice(0, 256),
    udf3: String(payload.customerName || '').slice(0, 256),
    udf4: sanitizePhoneNumber(payload.customerPhone || ''),
    udf5: 'arvindrai-booking'
  };
}

function mapPaymentState(rawState) {
  const normalized = String(rawState || '').toUpperCase();

  if (normalized === 'COMPLETED' || normalized === 'SUCCESS') {
    return 'success';
  }

  if (
    normalized === 'FAILED' ||
    normalized === 'FAILURE' ||
    normalized === 'DECLINED' ||
    normalized === 'CANCELLED' ||
    normalized === 'ERROR'
  ) {
    return 'failure';
  }

  return 'pending';
}

function formatPaymentError(error, fallbackMessage) {
  const responseData = error && error.response ? error.response.data : null;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData.trim();
  }

  if (responseData && typeof responseData === 'object') {
    if (responseData.message) {
      return String(responseData.message);
    }

    if (responseData.error) {
      return String(responseData.error);
    }

    if (responseData.code && responseData.message) {
      return String(responseData.code) + ': ' + String(responseData.message);
    }
  }

  if (error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function isPaymentAuthTokenUsable() {
  return Boolean(paymentAuthState.accessToken) && Date.now() < (paymentAuthState.expiresAtMs - 60000);
}

async function fetchPaymentAuthToken(config) {
  const requestBody = new URLSearchParams({
    client_id: config.clientId,
    client_version: String(config.clientVersion),
    client_secret: config.clientSecret,
    grant_type: config.grantType
  }).toString();

  const response = await axios.post(PHONEPE_PRODUCTION_AUTH_URL, requestBody, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    timeout: 20000
  });

  const data = response.data || {};
  const accessToken = String(data.access_token || '').trim();
  const tokenType = String(data.token_type || 'O-Bearer').trim() || 'O-Bearer';

  if (!accessToken) {
    throw new Error('PhonePe authorization token was not returned.');
  }

  const expiresAtEpochSeconds = Number(data.expires_at || 0);
  const expiresInSeconds = Number(data.expires_in || 0);

  let expiresAtMs = 0;
  if (Number.isFinite(expiresAtEpochSeconds) && expiresAtEpochSeconds > 0) {
    expiresAtMs = expiresAtEpochSeconds * 1000;
  } else if (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
    expiresAtMs = Date.now() + (expiresInSeconds * 1000);
  } else {
    expiresAtMs = Date.now() + (15 * 60 * 1000);
  }

  paymentAuthState.accessToken = accessToken;
  paymentAuthState.tokenType = tokenType;
  paymentAuthState.expiresAtMs = expiresAtMs;

  return {
    accessToken: paymentAuthState.accessToken,
    tokenType: paymentAuthState.tokenType
  };
}

async function getPaymentAuthToken(config, forceRefresh) {
  if (!forceRefresh && isPaymentAuthTokenUsable()) {
    return {
      accessToken: paymentAuthState.accessToken,
      tokenType: paymentAuthState.tokenType
    };
  }

  if (forceRefresh) {
    paymentAuthState.accessToken = '';
    paymentAuthState.expiresAtMs = 0;
  }

  if (paymentAuthRefreshPromise) {
    return paymentAuthRefreshPromise;
  }

  paymentAuthRefreshPromise = fetchPaymentAuthToken(config).finally(function() {
    paymentAuthRefreshPromise = null;
  });

  return paymentAuthRefreshPromise;
}

async function callPhonePeApi(config, requestConfig, retried) {
  const auth = await getPaymentAuthToken(config, false);

  const axiosConfig = {
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth.tokenType + ' ' + auth.accessToken
    }
  };

  if (requestConfig && requestConfig.headers) {
    axiosConfig.headers = Object.assign({}, axiosConfig.headers, requestConfig.headers);
  }

  try {
    if (String((requestConfig && requestConfig.method) || 'GET').toUpperCase() === 'GET') {
      return await axios.get(requestConfig.url, axiosConfig);
    }

    return await axios.post(requestConfig.url, requestConfig.data || {}, axiosConfig);
  } catch (error) {
    const statusCode = error && error.response ? Number(error.response.status) : 0;

    if (!retried && (statusCode === 401 || statusCode === 403)) {
      await getPaymentAuthToken(config, true);
      return callPhonePeApi(config, requestConfig, true);
    }

    throw error;
  }
}

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ──
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✦ MongoDB connected'))
    .catch(err => console.error('✗ MongoDB connection error:', err.message));
} else {
  console.warn('⚠ MONGO_URI not set — running without database');
}

// ── Cloudinary Config ──
const cloudinary = require('cloudinary').v2;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✦ Cloudinary configured');
}

// ── Serve frontend (optional — for simple deployments) ──
const FRONTEND_ROOT_CANDIDATES = [
  path.join(__dirname, '..'),
  __dirname
];

const FRONTEND_ROOT = FRONTEND_ROOT_CANDIDATES.find(function(candidatePath) {
  return fs.existsSync(path.join(candidatePath, 'index.html'));
}) || path.join(__dirname, '..');

app.use(express.static(FRONTEND_ROOT));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'index.html'));
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'privacy-policy', 'index.html'));
});

app.get('/terms-of-service', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'terms-of-service', 'index.html'));
});

app.get('/refund-policy', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'refund-policy', 'index.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'blog', 'index.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'services', 'index.html'));
});

app.get('/services/puja', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'services', 'puja', 'index.html'));
});

app.get('/services/puja/:category', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'services', 'puja', 'index.html'));
});

app.get('/service', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'service', 'index.html'));
});

app.get('/service/:slug', (req, res) => {
  const slug = encodeURIComponent(req.params.slug || '');
  res.redirect(302, '/service?slug=' + slug);
});

app.get('/blogread', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'blogread', 'index.html'));
});

app.get('/blog-post', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'blog-post', 'index.html'));
});

app.get('/blog/:slug', (req, res) => {
  const slug = encodeURIComponent(req.params.slug || '');
  res.redirect(302, '/blogread?slug=' + slug);
});

app.post('/api/get-token', async function(req, res) {
  const config = getPaymentConfig();

  if (!isPaymentConfigured(config)) {
    return res.status(503).json({
      success: false,
      error: 'Payment is not configured. Set PAYMENT_CLIENT_ID and PAYMENT_CLIENT_SECRET.'
    });
  }

  const payload = req.body || {};
  const amount = Number(payload.amount || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payment amount.'
    });
  }

  const amountInPaise = Math.round(amount * 100);
  if (amountInPaise < 100) {
    return res.status(400).json({
      success: false,
      error: 'Minimum payment amount is INR 1.00 (100 paisa).'
    });
  }

  const merchantOrderId = buildMerchantOrderId(payload.bookingReference);
  const redirectUrl = PAYMENT_REDIRECT_BASE_URL
    + '/?phonepeTxn=' + encodeURIComponent(merchantOrderId)
    + '&phonepeReturn=1';

  const paymentPayload = {
    merchantOrderId: merchantOrderId,
    amount: amountInPaise,
    expireAfter: config.expireAfterSeconds,
    paymentFlow: {
      type: 'PG_CHECKOUT',
      message: String(payload.service || 'Booking payment').slice(0, 256),
      merchantUrls: {
        redirectUrl: redirectUrl,
        callbackUrl: PAYMENT_CALLBACK_URL
      }
    },
    metaInfo: buildPaymentMeta(payload)
  };

  try {
    const response = await callPhonePeApi(config, {
      method: 'POST',
      url: PHONEPE_PRODUCTION_PAY_URL,
      data: paymentPayload
    }, false);

    const body = response.data || {};
    const tokenUrl = String(body.redirectUrl || '').trim();

    if (!tokenUrl) {
      return res.status(502).json({
        success: false,
        error: 'PhonePe did not return checkout token URL.'
      });
    }

    return res.json({
      success: true,
      tokenUrl: tokenUrl,
      paymentUrl: tokenUrl,
      transactionId: merchantOrderId,
      merchantOrderId: merchantOrderId,
      orderId: body.orderId || '',
      state: mapPaymentState(body.state || 'PENDING'),
      rawState: body.state || 'PENDING',
      expireAt: body.expireAt || null
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: formatPaymentError(error, 'Failed to fetch PhonePe checkout token.')
    });
  }
});

app.get('/api/payment/phonepe/status/:transactionId', async function(req, res) {
  const config = getPaymentConfig();

  if (!isPaymentConfigured(config)) {
    return res.status(503).json({
      success: false,
      error: 'Payment is not configured. Set PAYMENT_CLIENT_ID and PAYMENT_CLIENT_SECRET.'
    });
  }

  const merchantOrderId = String(req.params.transactionId || '').trim();
  if (!merchantOrderId) {
    return res.status(400).json({
      success: false,
      error: 'Missing transactionId.'
    });
  }

  const statusUrl = PHONEPE_PRODUCTION_STATUS_BASE_URL
    + '/' + encodeURIComponent(merchantOrderId)
    + '/status?details=false&errorContext=true';

  try {
    const response = await callPhonePeApi(config, {
      method: 'GET',
      url: statusUrl
    }, false);

    const body = response.data || {};
    const paymentDetails = Array.isArray(body.paymentDetails) ? body.paymentDetails : [];
    const latestAttempt = paymentDetails.length ? paymentDetails[0] : null;
    const paymentId = latestAttempt && latestAttempt.transactionId
      ? latestAttempt.transactionId
      : (body.orderId || merchantOrderId);

    return res.json({
      success: true,
      state: mapPaymentState(body.state || ''),
      rawState: body.state || '',
      transactionId: merchantOrderId,
      merchantOrderId: merchantOrderId,
      orderId: body.orderId || '',
      paymentId: paymentId,
      details: body
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: formatPaymentError(error, 'Failed to fetch PhonePe payment status.'),
      state: 'pending'
    });
  }
});

app.post('/api/payment/phonepe/callback', function(req, res) {
  res.json({ success: true });
});

app.post('/api/verify-payment', function(req, res) {
  res.status(410).json({
    verified: false,
    error: 'Legacy verification endpoint is no longer supported. Use PhonePe status endpoint.'
  });
});

// ── Routes ──
app.use('/api', require('./routes/booking'));
app.use('/api', require('./routes/contact'));
app.use('/api', require('./routes/astrology'));
app.use('/api', require('./routes/numerology'));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
