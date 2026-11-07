import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// Shows its children only to admins (role === 'admin'). Backend functions these
// pages call must ALSO check admin on the server; this gate is only the front door.
export default function AdminOnly({ children }) {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
          <Link to="/" className="text-blue-600 underline">Go to the home page</Link>
        </div>
      </div>
    );
  }
  return children;
}
