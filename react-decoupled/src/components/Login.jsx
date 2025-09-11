import React, { useEffect, useState } from 'react';
import { beginLogin, logout, isLoggedIn } from '../utils/oauth';

export default function Login() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => { isLoggedIn().then(setLoggedIn); }, []);

  if (loggedIn) {
    return (
      <div>
        <p>You're currently signed in.</p>
        <button onClick={() => { logout(); setLoggedIn(false); }}>Logout</button>
      </div>
    );
  }
  return (
    <div>
      <button onClick={beginLogin}>Sign in with Drupal</button>
    </div>
  );
}
