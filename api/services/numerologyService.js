const axios = require('axios');
const { getAccessToken } = require('./authService');

const NUMEROLOGY_BASE_URL = 'https://api.prokerala.com/v2/numerology';
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

async function callNumerologyApi(endpoint, params) {
  const url = `${NUMEROLOGY_BASE_URL}/${endpoint}`;
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
        throw toServiceError(retryError, 'Prokerala numerology API request failed after token refresh.');
      }
    }

    throw toServiceError(error, 'Prokerala numerology API request failed.');
  }
}

async function getBirthdayNumber(datetime) {
  const data = await callNumerologyApi('birthday-number', { datetime });
  const birthdayNumber = data.birthday_number || {};

  let normalizedNumber = null;
  if (typeof birthdayNumber.number === 'number') {
    normalizedNumber = birthdayNumber.number;
  } else if (typeof birthdayNumber.number === 'string' && birthdayNumber.number.trim() !== '') {
    const parsedNumber = Number(birthdayNumber.number);
    normalizedNumber = Number.isNaN(parsedNumber) ? null : parsedNumber;
  }

  return {
    number: normalizedNumber,
    description: typeof birthdayNumber.description === 'string' ? birthdayNumber.description : null
  };
}

module.exports = {
  getBirthdayNumber
};
