import React, { useState } from 'react';
import { auth } from '../firebaseClient';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      if (action === 'signUp') {
        await auth.createUserWithEmailAndPassword(email, password);
        setMessage('Sign up successful! You are now logged in.');
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        setMessage('Sign in successful!');
      }
      // The onAuthStateChanged listener in App.tsx will handle the redirect.
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      // Make Firebase errors more user-friendly
      let friendlyMessage = 'An unknown error occurred.';
      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            friendlyMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            friendlyMessage = 'Invalid email or password.';
            break;
          case 'auth/email-already-in-use':
            friendlyMessage = 'An account with this email already exists.';
            break;
          case 'auth/weak-password':
            friendlyMessage = 'The password must be at least 6 characters long.';
            break;
          default:
            friendlyMessage = err.message;
            break;
        }
      }
      setError(friendlyMessage);
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
      </div>
    </div>
  );
};

export default Auth;