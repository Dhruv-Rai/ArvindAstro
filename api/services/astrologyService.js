const axios = require('axios');
const { getAccessToken } = require('./authService');

const ASTROLOGY_BASE_URL = 'https://api.prokerala.com/v2/astrology';
const REQUEST_TIMEOUT_MS = 15000;

function toServiceError(error, message) {
  if (error && error.statusCode) {
    return error;
  }

  const serviceError = new Error(message);
  serviceError.statusCode = error && error.response && error.response.status ? error.response.status : 502;
  serviceError.details = error && error.response ? error.response.data : error.message;
  return serviceError;
}

async function callAstrologyApi(endpoint, params) {
  const url = `${ASTROLOGY_BASE_URL}/${endpoint}`;
  let accessToken = await getAccessToken();

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      },
      params,
      timeout: REQUEST_TIMEOUT_MS
    });

    return response.data && response.data.data ? response.data.data : {};
  } catch (error) {
    if (error.response && error.response.status === 401) {
      accessToken = await getAccessToken({ forceRefresh: true });

      try {
        const retryResponse = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          },
          params,
          timeout: REQUEST_TIMEOUT_MS
        });

        return retryResponse.data && retryResponse.data.data ? retryResponse.data.data : {};
      } catch (retryError) {
        throw toServiceError(retryError, 'Prokerala astrology API request failed after token refresh.');
      }
    }

    throw toServiceError(error, 'Prokerala astrology API request failed.');
  }
}

function getPrimaryValue(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const firstItem = items[0];
  if (!firstItem || typeof firstItem.name !== 'string') {
    return null;
  }

  return firstItem.name;
}

function selectCurrentPeriod(periods, referenceTimeMs) {
  if (!Array.isArray(periods) || periods.length === 0) {
    return null;
  }

  const normalized = periods.map(period => {
    const startMs = Date.parse(period.start);
    const endMs = Date.parse(period.end);
    return Object.assign({}, period, { _startMs: startMs, _endMs: endMs });
  });

  const activePeriod = normalized.find(period => Number.isFinite(period._startMs)
    && Number.isFinite(period._endMs)
    && period._startMs <= referenceTimeMs
    && referenceTimeMs < period._endMs);

  if (activePeriod) {
    return activePeriod;
  }

  const mostRecentPeriod = normalized
    .filter(period => Number.isFinite(period._startMs) && period._startMs <= referenceTimeMs)
    .sort((a, b) => b._startMs - a._startMs)[0];

  if (mostRecentPeriod) {
    return mostRecentPeriod;
  }

  const firstUpcomingPeriod = normalized
    .filter(period => Number.isFinite(period._startMs))
    .sort((a, b) => a._startMs - b._startMs)[0];

  return firstUpcomingPeriod || normalized[0];
}

function extractCurrentDasha(dashaData, referenceDate) {
  const referenceTimeMs = referenceDate.getTime();
  const currentDasha = selectCurrentPeriod(dashaData.dasha_periods, referenceTimeMs);
  const currentAntardasha = currentDasha ? selectCurrentPeriod(currentDasha.antardasha, referenceTimeMs) : null;
  const currentPratyantardasha = currentAntardasha
    ? selectCurrentPeriod(currentAntardasha.pratyantardasha, referenceTimeMs)
    : null;

  return {
    current_dasha: currentDasha ? currentDasha.name || null : null,
    current_antardasha: currentAntardasha ? currentAntardasha.name || null : null,
    current_pratyantardasha: currentPratyantardasha ? currentPratyantardasha.name || null : null,
    start: (currentPratyantardasha && currentPratyantardasha.start)
      || (currentAntardasha && currentAntardasha.start)
      || (currentDasha && currentDasha.start)
      || null,
    end: (currentPratyantardasha && currentPratyantardasha.end)
      || (currentAntardasha && currentAntardasha.end)
      || (currentDasha && currentDasha.end)
      || null
  };
}

async function getPanchang(lat, lng, datetime) {
  const data = await callAstrologyApi('panchang', {
    ayanamsa: 1,
    coordinates: `${lat},${lng}`,
    datetime,
    la: 'en'
  });

  return {
    day: data.vaara || null,
    nakshatra: getPrimaryValue(data.nakshatra),
    tithi: getPrimaryValue(data.tithi),
    yoga: getPrimaryValue(data.yoga),
    karana: getPrimaryValue(data.karana),
    sunrise: data.sunrise || null,
    sunset: data.sunset || null
  };
}

async function getDasha(lat, lng, datetime, yearLength) {
  const data = await callAstrologyApi('dasha-periods', {
    ayanamsa: 1,
    coordinates: `${lat},${lng}`,
    datetime,
    la: 'en',
    year_length: yearLength
  });

  return extractCurrentDasha(data, new Date());
}

module.exports = {
  getPanchang,
  getDasha
};
