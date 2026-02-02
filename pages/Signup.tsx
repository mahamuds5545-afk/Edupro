
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, dbOps } from '../dbService';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Check if this is the first user
      const existingUsers = await dbOps.get('users');
      const isFirstUser = !existingUsers || Object.keys(existingUsers).length === 0;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Initialize User Profile in RTDB
      // First user becomes admin automatically
      await dbOps.set(`users/${uid}`, {
        uid,
        name,
        email,
        role: isFirstUser ? 'admin' : 'user',
        balance: 0,
        createdAt: Date.now()
      });
      
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <div className="max-w-md w-full glass p-8 rounded-3xl shadow-2xl space-y-8 border border-white">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-indigo-700 tracking-tight">Join EduPro</h2>
          <p className="mt-2 text-sm text-gray-500">Start your professional learning path today</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSignup}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Full Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
