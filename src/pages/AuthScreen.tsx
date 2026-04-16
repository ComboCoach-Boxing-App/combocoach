import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import './AuthScreen.css'; 
import { FcGoogle } from 'react-icons/fc';

const AuthScreen: React.FC = () => {
  const { signInAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Registration successful! Please check your email to verify your account if required.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `An error occurred during ${provider} login.`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src="/assets/logo.png" alt="ComboCoach Logo" className="auth-logo" />
        </div>
        <p className="auth-subtitle">{isLogin ? 'Welcome back, Champion' : 'Start your boxing journey'}</p>
        {isLogin && <div className="header-divider"></div>}

        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}

        {isLogin && (
          <>
            <div className="oauth-buttons">
              <button className="auth-button oauth" onClick={() => handleOAuthLogin('google')} disabled={loading}>
                <FcGoogle size={20} />
                <span>Google</span>
              </button>
            </div>

            <div className="auth-divider">
              <span>or use email</span>
            </div>
          </>
        )}

        <form onSubmit={handleEmailAuth} className="auth-form">
          <div className="input-group">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              onInvalid={(e: any) => e.target.setCustomValidity('Please enter your email')}
              onInput={(e: any) => e.target.setCustomValidity('')}
            />
          </div>
          <div className="input-group">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              onInvalid={(e: any) => e.target.setCustomValidity('Please enter your password')}
              onInput={(e: any) => e.target.setCustomValidity('')}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="text-button" onClick={() => setIsLogin(!isLogin)} disabled={loading}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="guest-section">
            <button className="text-button guest-button" onClick={signInAsGuest} disabled={loading}>
              Continue as Guest (Free Tier Only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
