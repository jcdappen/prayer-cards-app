
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Login successful, the App component will re-render due to onAuthStateChange
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Check your email for the confirmation link!');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white shadow-xl rounded-lg">
        <div>
          <h1 className="font-serif text-3xl font-bold text-center text-sky-800">Welcome</h1>
          <p className="mt-2 text-center text-gray-600">Sign in to save your prayer cards</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-sky-700 rounded-md hover:bg-sky-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-sky-700 bg-white border border-sky-700 rounded-md hover:bg-sky-50 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
