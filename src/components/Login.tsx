import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react';

interface LoginProps {
  onRegisterClick: () => void;
}

function Login({ onRegisterClick }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (!success) {
      setError('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <LogIn size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#64748b' }}>
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#fee2e2', 
            border: '1px solid #fecaca',
            borderRadius: '0.5rem', 
            color: '#991b1b',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Password
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', padding: '1rem 0', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Don't have an account?
          </p>
          <button 
            onClick={onRegisterClick}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UserPlus size={16} />
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login; 