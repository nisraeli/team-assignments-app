import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onBackToLogin: () => void;
}

function Register({ onBackToLogin }: RegisterProps) {
  const { acceptInvitation, isEmailInvited } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Check if email is invited
    if (!isEmailInvited(email)) {
      setError('This email has not been invited. Please contact an administrator.');
      setIsLoading(false);
      return;
    }

    const success = await acceptInvitation(email, password);
    
    if (!success) {
      setError('Failed to create account. Please try again.');
    } else {
      setSuccess('Account created successfully! You are now logged in.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <UserPlus size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b' }}>
            Complete your invitation to join the team
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

        {success && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#d1fae5', 
            border: '1px solid #a7f3d0',
            borderRadius: '0.5rem', 
            color: '#065f46',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {success}
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
              placeholder="Enter your invited email"
              required
              disabled={isLoading}
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Use the email address you received the invitation for
            </p>
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
              placeholder="Create a password"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Confirm Password
            </label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', padding: '1rem 0', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Already have an account?
          </p>
          <button 
            onClick={onBackToLogin}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '0.5rem',
          border: '1px solid #bae6fd'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            📧 Invitation Required
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            You can only register with an email that has been invited by an administrator. 
            Contact your team lead if you need an invitation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register; 