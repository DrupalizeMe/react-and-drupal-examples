import React, {useState} from "react";
import {fetchWithCSRFToken} from "../utils/fetch";

const NodeForm = ({id, title, body, onSuccess}) => {
  const [isSubmitting, setSubmitting] = useState(false);

  const [result, setResult] = useState({
    success: null,
    error: null,
    message: '',
  });

  const defaultValues = {
    title: title ? title : '',
    body: body ? body : '',
  };
  const [values, setValues] = useState(defaultValues);

  const handleInputChange = (event) => {
    const {name, value} = event.target;
    setValues({...values, [name]: value});
  };

  const handleSubmit = (event) => {
    setSubmitting(true);
    event.preventDefault();

    const csrfUrl = `/session/token?_format=json`;
    const fetchUrl = id ? `/jsonapi/node/article/${id}` : `/jsonapi/node/article`;

    let data = {
      "data": {
        "type": "node--article",
        "attributes": {
          "title": `${values.title}`,
          "body": {
            "value": `${values.body}`,
            "format": 'plain_text',
          }
        }
      }
    };

    // If we have an ID that means we're editing an existing node and not
    // creating a new one.
    if (id) {
      // Set the ID in the data we'll send to the API.
      data.data.id = id;
    }

    const fetchOptions = {
      // Use HTTP PATCH for edits, and HTTP POST to create new articles.
      method: id ? 'PATCH' : 'POST',
      credentials: 'same-origin',
      headers: new Headers({
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Cache': 'no-cache'
      }),
      body: JSON.stringify(data),
    };

    try {
      fetchWithCSRFToken(csrfUrl, fetchUrl, fetchOptions)
        .then((response) => response.json())
        .then((data) => {
          // We're done processing.
          setSubmitting(false);

          // If there are any errors display the error and return early.
          if (data.errors && data.errors.length > 0) {
            setResult({
              success: false,
              error: true,
              message: <div className="messages messages--error">{data.errors[0].title}: {data.errors[0].detail}</div>,
            });
            return false;
          }

          // If the request was successful, remove existing form values and
          // display a success message.
          setValues(defaultValues);
          if (data.data.id) {
            setResult({
              success: true,
              message: <div className="messages messages--status">{(id ? 'Updated' : 'Added')}: <em>{data.data.attributes.title}</em></div>,
            });

            if (typeof onSuccess === 'function') {
              onSuccess(data.data);
            }
          }
        });
    } catch (error) {
      console.log('Error while contacting API', error);
      setSubmitting(false);
    }
  };

  // If the form is currently being processed display a spinner.
  if (isSubmitting) {
    return (
      <div>
        Processing ...
      </div>
    )
  }

  return (
    <div>
      {(result.success || result.error) &&
        <div>
          <h2>{(result.success ? 'Success!' : 'Error')}:</h2>
          {result.message}
        </div>
      }
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          type="text"
          value={values.title}
          placeholder="Title"
          onChange={handleInputChange}
        />
        <br/>
        <textarea
          name="body"
          rows="4"
          cols="30"
          value={values.body}
          placeholder="Body"
          onChange={handleInputChange}
        />
        <br/>
        <input
          name="submit"
          type="submit"
          value={id ? 'Edit existing node' : 'Add new node'}
        />
      </form>
    </div>
  )
};

export default NodeForm;
