const express = require('express');
const { getBirthdayNumber } = require('../services/numerologyService');

const router = express.Router();

function sendValidationError(res, message) {
  return res.status(400).json({ error: message });
}

function sendServiceError(res, error) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const payload = { error: error.message || 'Unexpected server error.' };

  if (process.env.NODE_ENV !== 'production' && error.details !== undefined) {
    payload.details = error.details;
  }

  return res.status(statusCode).json(payload);
}

function isValidDateTime(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

router.get('/numerology', async (req, res) => {
  const { datetime } = req.query;

  if (!datetime) {
    return sendValidationError(res, 'Required query parameter: datetime.');
  }

  if (!isValidDateTime(datetime)) {
    return sendValidationError(res, 'Query parameter "datetime" must be a valid ISO date-time string.');
  }

  try {
    const numerology = await getBirthdayNumber(datetime);
    return res.json(numerology);
  } catch (error) {
    return sendServiceError(res, error);
  }
});

module.exports = router;
