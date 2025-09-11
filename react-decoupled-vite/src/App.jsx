import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import NodeReadWrite from './components/NodeReadWrite';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Login />
              <NodeReadWrite />
            </>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
