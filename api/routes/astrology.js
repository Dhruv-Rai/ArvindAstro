const express = require('express');
const { getPanchang, getDasha } = require('../services/astrologyService');

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

function parseCoordinates(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { error: 'Query parameter "lat" must be a valid latitude between -90 and 90.' };
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { error: 'Query parameter "lng" must be a valid longitude between -180 and 180.' };
  }

  return { latitude, longitude };
}

function isValidDateTime(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function parseYearLength(value) {
  if (value === undefined || value === '') {
    return { yearLength: 1 };
  }

  const yearLength = Number(value);
  if (!Number.isInteger(yearLength) || yearLength < 1 || yearLength > 120) {
    return { error: 'Query parameter "year_length" must be an integer between 1 and 120.' };
  }

  return { yearLength };
}

router.get('/panchang', async (req, res) => {
  const { lat, lng, datetime } = req.query;

  if (lat === undefined || lng === undefined || !datetime) {
    return sendValidationError(res, 'Required query parameters: lat, lng, datetime.');
  }

  const coordinates = parseCoordinates(lat, lng);
  if (coordinates.error) {
    return sendValidationError(res, coordinates.error);
  }

  if (!isValidDateTime(datetime)) {
    return sendValidationError(res, 'Query parameter "datetime" must be a valid ISO date-time string.');
  }

  try {
    const panchang = await getPanchang(coordinates.latitude, coordinates.longitude, datetime);
    return res.json(panchang);
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.get('/dasha', async (req, res) => {
  const { lat, lng, datetime, year_length: yearLengthQuery } = req.query;

  if (lat === undefined || lng === undefined || !datetime) {
    return sendValidationError(res, 'Required query parameters: lat, lng, datetime.');
  }

  const coordinates = parseCoordinates(lat, lng);
  if (coordinates.error) {
    return sendValidationError(res, coordinates.error);
  }

  if (!isValidDateTime(datetime)) {
    return sendValidationError(res, 'Query parameter "datetime" must be a valid ISO date-time string.');
  }

  const parsedYearLength = parseYearLength(yearLengthQuery);
  if (parsedYearLength.error) {
    return sendValidationError(res, parsedYearLength.error);
  }

  try {
    const dasha = await getDasha(
      coordinates.latitude,
      coordinates.longitude,
      datetime,
      parsedYearLength.yearLength
    );
    return res.json(dasha);
  } catch (error) {
    return sendServiceError(res, error);
  }
});

module.exports = router;
