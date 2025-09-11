/**
 * Helper function wraps a normal fetch call with a fetch request that first
 * retrieves a CSRF token and then adds the token as an X-CSRF-Token header
 * to the options for desired fetch call.
 *
 * @param {string} csrfUrl
 *   URL where we can retrieve a CSRF token for the current user.
 * @param {string} fetchUrl
 *   URL to fetch with X-CSRF-Token header included.
 * @param {object} fetchOptions
 *   Options to pass to fetch for the call to fetchUrl.
 */
export const fetchWithCSRFToken = (csrfUrl, fetchUrl, fetchOptions) => {
  if (!fetchOptions.headers.get('X-CSRF-Token')) {
    return fetch(csrfUrl)
      .then(response => response.text())
      .then((csrfToken) => {
        fetchOptions.headers.append('X-CSRF-Token', csrfToken);
        return fetch(fetchUrl, fetchOptions);
      });
  }
  else {
    return fetch(fetchUrl, fetchOptions);
  }
};
