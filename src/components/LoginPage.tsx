import React, { useState } from 'react';

interface LoginPageProps {
  onAuthenticate: (role: 'patient' | 'admin', name: string) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticate, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'admin' | null>(null);
  const [userName, setUserName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && userName.trim()) {
      onAuthenticate(selectedRole, userName);
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setSelectedRole(null);
    setUserName('');
    onBack();
  };

  return (
    <div className="app-layout" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <button
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '40px',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            (e.currentTarget).style.borderColor = 'var(--primary)';
            (e.currentTarget).style.color = 'var(--text-primary)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget).style.borderColor = 'var(--border-color)';
            (e.currentTarget).style.color = 'var(--text-secondary)';
          }}
        >
          ← Back to Home
        </button>

        {!showForm ? (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(28px, 6vw, 40px)',
              fontWeight: 700,
              marginBottom: '16px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              Welcome to Pharma Connect
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              marginBottom: '48px',
              lineHeight: '1.6'
            }}>
              Select your role to continue
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => {
                  setSelectedRole('patient');
                  setShowForm(true);
                }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--primary)',
                  color: 'var(--text-primary)',
                  padding: '24px 32px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  (e.currentTarget).style.transform = 'translateX(4px)';
                  (e.currentTarget).style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget).style.transform = 'translateX(0)';
                  (e.currentTarget).style.background = 'var(--bg-card)';
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 700 }}>Patient Portal</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400 }}>
                  Browse medications, place orders, track deliveries
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedRole('admin');
                  setShowForm(true);
                }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--accent)',
                  color: 'var(--text-primary)',
                  padding: '24px 32px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  (e.currentTarget).style.transform = 'translateX(4px)';
                  (e.currentTarget).style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget).style.transform = 'translateX(0)';
                  (e.currentTarget).style.background = 'var(--bg-card)';
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 700 }}>Pharmacist Admin</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400 }}>
                  Manage inventory, view analytics, process orders
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-card)',
            padding: '40px 32px',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '24px',
              color: 'var(--text-primary)',
              textAlign: 'center'
            }}>
              {selectedRole === 'patient' ? 'Enter as Patient' : 'Enter as Pharmacist'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <span className="input-label">Full Name</span>
                <input
                  type="text"
                  className="input-field"
                  placeholder={selectedRole === 'patient' ? 'e.g., John Doe' : 'e.g., Dr. Sarah Smith'}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedRole(null);
                    setUserName('');
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={!userName.trim()}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
