const axios = require('axios');

const TOKEN_URL = 'https://api.prokerala.com/token';
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 15000;

const tokenState = {
  accessToken: null,
  expiresAt: 0
};

let tokenRefreshPromise = null;

function ensureOAuthConfig() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const error = new Error('Missing OAuth credentials. Set CLIENT_ID and CLIENT_SECRET.');
    error.statusCode = 500;
    throw error;
  }

  return { clientId, clientSecret };
}

function hasValidToken() {
  return Boolean(tokenState.accessToken) && Date.now() < (tokenState.expiresAt - TOKEN_EXPIRY_BUFFER_MS);
}

async function fetchAccessToken() {
  const { clientId, clientSecret } = ensureOAuthConfig();
  const requestBody = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  }).toString();

  try {
    const response = await axios.post(TOKEN_URL, requestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      timeout: REQUEST_TIMEOUT_MS
    });

    const accessToken = response.data && response.data.access_token;
    const expiresInSeconds = Number(response.data && response.data.expires_in);

    if (!accessToken || !Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      const error = new Error('Invalid OAuth token response from Prokerala.');
      error.statusCode = 502;
      error.details = response.data;
      throw error;
    }

    tokenState.accessToken = accessToken;
    tokenState.expiresAt = Date.now() + (expiresInSeconds * 1000);

    return tokenState.accessToken;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const authError = new Error('Failed to obtain OAuth access token from Prokerala.');
    authError.statusCode = 502;
    authError.details = error.response ? error.response.data : error.message;
    throw authError;
  }
}

async function getAccessToken(options = {}) {
  const forceRefresh = Boolean(options.forceRefresh);

  if (forceRefresh) {
    tokenState.accessToken = null;
    tokenState.expiresAt = 0;
  }

  if (!forceRefresh && hasValidToken()) {
    return tokenState.accessToken;
  }

  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = fetchAccessToken().finally(() => {
    tokenRefreshPromise = null;
  });

  return tokenRefreshPromise;
}

module.exports = {
  getAccessToken
};
