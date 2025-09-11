/**
 * @file src/utils/oauth.js
 *
 * Utility functions to generate @PKCE values and manage OAuth tokens in the
 * browser.
 *
 * This file uses Web Crypto API; supported in all modern browsers.
 */

/**
 * Configuration object for OAuth authentication.
 *
 * Contains information necessary for handling OAuth authorization and token
 * management, including endpoints, client credentials, and storage settings.
 *
 * @property {string} base
 *   The base URL of the OAuth server.
 * @property {string} authorizeEndpoint
 *   The path to the authorization endpoint on the OAuth server.
 * @property {string} tokenEndpoint
 *   The path to the token endpoint on the OAuth server.
 * @property {string} client_id
 *   The client identifier used to authenticate with the OAuth server.
 * @property {string} redirect_uri
 *   The URI to which the OAuth server redirects after authorization.
 * @property {string} scope
 *   The scope of access requested; should match the configured scopes in the
 *   OAuth client.
 * @property {string} storageKey
 *   The key used to store the OAuth token in local storage.
 * @property {number} expireMarginSec
 *   The time margin, in seconds, to refresh the token slightly before expiry.
 */
const OAUTH_CONFIG = {
  base: 'https://react-tutorials-2.ddev.site',
  authorizeEndpoint: '/oauth/authorize',
  tokenEndpoint: '/oauth/token',
  client_id: 'react_app_spa',
  redirect_uri: 'http://localhost:5173/auth/callback',
  scope: 'oauth', // must match configured scopes on your OAuth client
  storageKey: 'drupal-oauth-token',
  expireMarginSec: 15, // refresh slightly before expiry
};

/**
 * Encodes an ArrayBuffer into a Base64 URL-safe string.
 *
 * @param {ArrayBuffer} arrBuf - The ArrayBuffer to encode into a Base64
 * URL-safe string.
 * @return {string} A Base64 URL-safe encoded string representation of the input
 * ArrayBuffer.
 */
function base64UrlEncode(arrBuf) {
  return btoa(String.fromCharCode(...new Uint8Array(arrBuf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Computes the SHA-256 hash, and then base64 encodes the given input string.
 *
 * @param {string} input - The input string to be hashed.
 * @return {Promise<string>} A promise that resolves to the Base64 URL-encoded
 * SHA-256 hash of the input string.
 */
async function sha256(input) {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

/**
 * Helper to generate random string for @PKCE.
 */
function randomString(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base64UrlEncode(arr);
}

/**
 * Initiates the login process by generating a PKCE (Proof Key for Code
 * Exchange) verifier and challenge, storing the verifier temporarily in the
 * session storage, and redirecting the user to the authorization endpoint.
 *
 * @return {Promise<void>} A promise that resolves when the redirection to the
 * authorization endpoint is executed.
 */
export async function beginLogin() {
  // Create PKCE verifier/challenge and store verifier temporarily
  const code_verifier = randomString(64);
  const code_challenge = await sha256(code_verifier);
  sessionStorage.setItem('pkce_verifier', code_verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: OAUTH_CONFIG.client_id,
    redirect_uri: OAUTH_CONFIG.redirect_uri,
    code_challenge: code_challenge,
    code_challenge_method: 'S256',
    scope: OAUTH_CONFIG.scope,
  });

  window.location.assign(
    `${OAUTH_CONFIG.base}${OAUTH_CONFIG.authorizeEndpoint}?${params.toString()}`
  );
}

/**
 * Handles the OAuth2 authorization callback.
 *
 * This exchanges the authorization code for an access token. This method is
 * typically invoked on a designated redirect route after the user
 * authenticates.
 *
 * @param {string} currentUrl - The current URL containing the authorization
 * code and optional state parameter.
 * @return {Promise<any>} A promise that resolves with the token object after a
 * successful exchange, or rejects with an error if the exchange fails.
 */
export async function handleAuthCallback(currentUrl) {
  // Called on your redirect route; exchanges ?code= for tokens
  const url = new URL(currentUrl);
  const code = url.searchParams.get('code');
  // eslint-disable-next-line no-unused-vars
  const state = url.searchParams.get('state'); // if you add state, verify it here
  if (!code) throw new Error('Missing authorization code');

  const code_verifier = sessionStorage.getItem('pkce_verifier');
  if (!code_verifier) throw new Error('Missing PKCE verifier');

  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: OAUTH_CONFIG.client_id,
    redirect_uri: OAUTH_CONFIG.redirect_uri,
    code,
    code_verifier,
  });

  const res = await fetch(`${OAUTH_CONFIG.base}${OAUTH_CONFIG.tokenEndpoint}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString(),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Token exchange failed');

  sessionStorage.removeItem('pkce_verifier');
  return saveToken(data);
}

/**
 * Logs the user out by removing the OAuth token from local storage.
 *
 * @return {void} This function does not return a value.
 */
export function logout() {
  localStorage.removeItem(OAUTH_CONFIG.storageKey);
}

/**
 * Retrieves the stored token from localStorage.
 *
 * @return {object|null} The parsed token object if it exists, or null if no
 * token is stored.
 */
export function getStoredToken() {
  const raw = localStorage.getItem(OAUTH_CONFIG.storageKey);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Saves the provided token data to local storage.
 *
 * @param {Object} data The token data to be saved. It should include properties
 * like `expires_in`.
 * @param {number} [data.expires_in] Optional expiration duration in seconds.
 * @return {Object} The token object with `obtained_at` and `expires_at`
 * timestamps added.
 */
function saveToken(data) {
  const now = Math.floor(Date.now() / 1000);
  const token = {
    ...data,
    obtained_at: now,
    expires_at: now + (data.expires_in || 0)
  };
  localStorage.setItem(OAUTH_CONFIG.storageKey, JSON.stringify(token));
  return token;
}

/**
 * Refreshes the OAuth access token using a provided refresh token.
 *
 * @param {string} refresh_token The refresh token to use for obtaining a new
 * access token.
 * @return {Promise<Object>} A promise that resolves to the new token data, or
 * rejects with an error if the refresh fails.
 */
async function refreshToken(refresh_token) {
  const form = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: OAUTH_CONFIG.client_id,
    refresh_token
  });
  const res = await fetch(`${OAUTH_CONFIG.base}${OAUTH_CONFIG.tokenEndpoint}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString(),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Refresh failed');
  return saveToken(data);
}

// --- Concurrency control: ensure only one refresh runs at a time ---
let refreshInFlight = null;

/**
 * Retrieves a valid token for the user.
 *
 * If a stored token exists and is not expired, it is returned. If the token is
 * expired and has a refresh token, attempts to refresh it (coalescing
 * concurrent calls so only one refresh runs). If refreshing fails or no valid
 * token is available, returns null and logs the user out if necessary.
 *
 * @return {Promise<Object|null>} A valid token object if available, otherwise
 * null.
 */
export async function getValidToken() {
  const t = getStoredToken();
  if (!t) return null;
  const now = Math.floor(Date.now() / 1000);
  if ((t.expires_at - OAUTH_CONFIG.expireMarginSec) > now) return t;
  if (!t.refresh_token) return null;

  // Coalesce concurrent refresh attempts.
  if (refreshInFlight) {
    try {
      return await refreshInFlight;
    } catch {
      return null;
    }
  }

  refreshInFlight = (async () => {
    try {
      const refreshed = await refreshToken(t.refresh_token);
      return refreshed;
    } finally {
      refreshInFlight = null; // always clear
    }
  })();

  try {
    return await refreshInFlight;
  } catch {
    logout();
    return null;
  }
}

/**
 * Wrapper for native fetch() that injects Bearer access token to every request.
 * Also retries once on 401 after attempting a coalesced refresh.
 */
export async function fetchWithAuthentication(path, options = {}) {
  const opts = {...options, headers: new Headers(options.headers || {})};
  const token = await getValidToken();
  if (token?.access_token) {
    opts.headers.set('Authorization', `Bearer ${token.access_token}`);
  }
  // JSON:API usually needs Accept header
  if (!opts.headers.has('Accept')) opts.headers.set('Accept', 'application/vnd.api+json');

  let res = await fetch(`${OAUTH_CONFIG.base}${path}`, opts);

  // Defensive retry: if unauthorized, attempt one coalesced refresh then retry once.
  if (res.status === 401) {
    const maybeAfterRefresh = await getValidToken();
    if (maybeAfterRefresh?.access_token) {
      opts.headers.set('Authorization', `Bearer ${maybeAfterRefresh.access_token}`);
      res = await fetch(`${OAUTH_CONFIG.base}${path}`, opts);
    }
  }

  return res;
}

/**
 * Checks whether a user is logged in by validating the existence of a valid
 * token.
 *
 * @return {Promise<boolean>} A promise that resolves to true if a valid token
 * exists, otherwise false.
 */
export async function isLoggedIn() {
  const t = await getValidToken();
  return !!t;
}

export const OAuthConfig = OAUTH_CONFIG;
