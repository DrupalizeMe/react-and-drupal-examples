import React from "react";
import { fetchWithCSRFToken } from "../utils/fetch";

const NodeDelete = ({ id, title, onSuccess }) => {
  function doConfirm() {
    return window.confirm(`Are you sure you want to delete ${title}?`);
  }

  function doDelete() {
    const csrfUrl = `/session/token?_format=json`;
    const fetchUrl = `/jsonapi/node/article/${id}`;
    const fetchOptions = {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: new Headers({
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Cache': 'no-cache'
      }),
    };

    try {
      fetchWithCSRFToken(csrfUrl, fetchUrl, fetchOptions)
        .then((response) => {
          // Should be 204. If so, call the onSuccess callback.
          if (response.status === 204) {
            // Do any additional work here.
          }
        });
    } catch (error) {
      console.log('API error', error);
    }

    if (typeof onSuccess === 'function') {
      onSuccess(id);
    }
  }

  return (
    <button onClick={event => doConfirm() && doDelete()}>
      delete
    </button>
  );
};

export default NodeDelete;
