import React, { useEffect, useRef, useState } from 'react';
import { handleAuthCallback } from '../utils/oauth';

export default function AuthCallback() {
  const [message, setMessage] = useState('Completing sign-in…');
  const ran = useRef(false); // run once even under StrictMode dev

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    handleAuthCallback(window.location.href)
      .then(() => setMessage('Sign‑in complete. You can go back, or click the link to return to the frontpage.'))
      .catch((e) => setMessage(`Sign-in failed: ${e.message}`));
  }, []);

  return <div>
    <p>{message}</p>
    <p><a href="/">Return to frontpage</a></p>
  </div>;
}
