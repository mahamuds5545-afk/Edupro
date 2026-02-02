
import React, { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../dbService';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Set persistence based on "Remember Me"
      if (rememberMe) {
        await setPersistence(auth, browserLocalPersistence);
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log("Logged in successfully:", userCredential.user.uid);
      navigate('/');
    } catch (err: any) {
      console.error("Login Error:", err.code, err.message);
      let friendlyMsg = "Failed to sign in. Please check your credentials.";
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMsg = "Incorrect email or password. Please try again.";
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMsg = "Network error. Please check your internet connection.";
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMsg = "Too many failed attempts. Please try again later.";
      }
      
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <div className="max-w-md w-full glass p-8 rounded-[2.5rem] shadow-2xl space-y-8 border border-white animate-slide-up">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-xl mb-6">🔑</div>
          <h2 className="text-4xl font-black text-indigo-700 tracking-tighter">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Continue your learning journey with EduPro</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm border-2 border-red-100 flex items-center gap-3 animate-pulse">
            <span className="text-xl">⚠️</span>
            <span className="font-bold">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className={`w-10 h-5 bg-gray-200 rounded-full shadow-inner transition-colors ${rememberMe ? 'bg-indigo-600' : ''}`}></div>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rememberMe ? 'translate-x-5' : ''}`}></div>
              </div>
              <span className="ml-3 text-sm font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">Remember me</span>
            </label>
            <button type="button" className="text-sm font-bold text-indigo-600 hover:underline">Forgot?</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-5 px-4 rounded-[2rem] shadow-2xl text-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em]"
          >
            {loading ? 'Verifying...' : 'Sign In Now'}
          </button>
        </form>

        <div className="pt-4 text-center border-t border-gray-100">
           <p className="text-gray-500 font-medium">
            Don't have an account? <Link to="/signup" className="font-black text-indigo-600 hover:text-indigo-700 underline">Join Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
