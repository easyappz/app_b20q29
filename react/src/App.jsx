import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Home } from './components/Home';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Profile } from './components/Profile/Profile';
import { AdForm } from './components/Ads/AdForm';
import { AdDetail } from './components/Ads/AdDetail';
import { Chat } from './components/Chat/Chat';

function App() {
  // Never remove this code
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      // Pass the list of existing routes
      window.handleRoutes([
        '/',
        '/login',
        '/register',
        '/profile',
        '/ads/new',
        '/ads/:id',
        '/ads/:id/edit',
        '/chat',
      ]);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ads/new" element={<AdForm mode="create" />} />
        <Route path="/ads/:id" element={<AdDetail />} />
        <Route path="/ads/:id/edit" element={<AdForm mode="edit" />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
