import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    setLoading(true);
    setMessage('');
    setError('');
    setDebugInfo('');
    
    console.log('Auth action started:', action);
    console.log('Supabase URL:', supabase.supabaseUrl);
    
    try {
      setDebugInfo('Attempting authentication...');
      
      const { data, error: authError } = action === 'signIn'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      console.log('Auth response:', { data, error: authError });
      setDebugInfo(`Auth response: ${JSON.stringify({ user: data?.user?.id, session: !!data?.session })}`);

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (action === 'signUp') {
        setMessage('Sign up successful! You are now logged in.');
      } else {
        setMessage('Sign in successful!');
      }
      
    } catch (err: any) {
      console.error('Full error:', err);
      setError(`Error: ${err.error_description || err.message || 'Unknown error'}`);
      setDebugInfo(`Error details: ${JSON.stringify(err)}`);
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

        {message && <p className="text-center text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}
        {error && <p className="text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        {debugInfo && <p className="text-center text-blue-600 bg-blue-50 p-3 rounded-md text-xs">{debugInfo}</p>}
        
        <div className="space-y-6">
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
              onClick={() => handleAuthAction('signIn')}
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-sky-700 rounded-md hover:bg-sky-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              onClick={() => handleAuthAction('signUp')}
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-sky-700 bg-white border border-sky-700 rounded-md hover:bg-sky-50 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </div>
        
        {/* Debug-Informationen */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <p><strong>Supabase URL:</strong> {supabase.supabaseUrl}</p>
          <p><strong>Current URL:</strong> {window.location.origin}</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

// Fügen Sie diesen Test zu Ihrer Auth.tsx hinzu (temporär)

const testSupabaseConnection = async () => {
  console.log('=== SUPABASE CONNECTION TEST ===');
  console.log('URL:', supabase.supabaseUrl);
  console.log('Window Location:', window.location.href);
  
  try {
    // Test 1: Einfache Anmeldung
    console.log('Testing signup...');
    const { data, error } = await supabase.auth.signUp({
      email: 'test123@gmail.com',
      password: 'password123'
    });
    
    console.log('Signup result:', { 
      user: data?.user?.id || 'null',
      session: data?.session ? 'exists' : 'null',
      error: error?.message || 'none'
    });
    
    if (error) {
      console.error('Signup error details:', error);
    }
    
  } catch (err) {
    console.error('Connection error:', err);
  }
};

// Button zu Ihrer Auth.tsx hinzufügen:
<button 
  onClick={testSupabaseConnection}
  className="w-full px-4 py-2 font-bold text-gray-700 bg-yellow-200 rounded-md hover:bg-yellow-300"
>
  🔧 Debug Test
</button>