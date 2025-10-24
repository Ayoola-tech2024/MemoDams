"use client";

import { useState, useEffect, useCallback } from 'react';

const ADMIN_SESSION_KEY = 'admin-auth-session';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check session storage on initial load
    try {
        const sessionValue = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (sessionValue) {
            const { isAdmin: storedIsAdmin, expiry } = JSON.parse(sessionValue);
            if (storedIsAdmin && new Date().getTime() < expiry) {
                setIsAdmin(true);
            } else {
                sessionStorage.removeItem(ADMIN_SESSION_KEY);
            }
        }
    } catch (error) {
        // If JSON parsing fails, clear the item
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((username, password) => {
    // In a real app, this would be a call to a server endpoint.
    // For this prototype, we're hardcoding the credentials.
    if (username === 'Admin' && password === 'Password') {
      const expiry = new Date().getTime() + 60 * 60 * 1000; // 1 hour session
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ isAdmin: true, expiry }));
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, isLoading, login, logout };
}
