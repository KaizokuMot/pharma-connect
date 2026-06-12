import { useState, useEffect } from 'react';
import { PatientFlow } from './components/PatientFlow.tsx';
import { AdminFlow } from './components/AdminFlow.tsx';
import { Homepage } from './components/Homepage.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { mockDb } from './data/mockDb.ts';
import { mockAuth } from './utils/auth.ts';

// Type definition
type AuthUser = {
  id: string;
  name: string;
  role: 'patient' | 'admin';
  loginTime: Date;
};

function App() {
  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Navigation state (only used when authenticated)
  const [role, setRole] = useState<'patient' | 'admin'>('patient');
  const [patientTab, setPatientTab] = useState<'search' | 'cart' | 'orders'>('search');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'inventory'>('dashboard');
  
  // Shared Cart State
  const [cart, setCart] = useState<{ drugId: string; quantity: number }[]>([]);

  // Total items in cart
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const currentUser = mockAuth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setRole(currentUser.role);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pharma_theme', theme);
  }, [theme]);

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('pharma_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleAuthenticate = (authRole: 'patient' | 'admin', userName: string) => {
    const newUser = mockAuth.authenticate(authRole, userName);
    setUser(newUser);
    setRole(authRole);
    setPatientTab('search');
    setAdminTab('dashboard');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      mockAuth.logout();
      setUser(null);
      setCart([]);
    }
  };

  const handleResetDb = () => {
    if (window.confirm('Reset network database to initial sample data?')) {
      mockDb.resetDb();
      setCart([]);
      setPatientTab('search');
      setAdminTab('dashboard');
      window.location.reload();
    }
  };

  // Show homepage if not authenticated
  if (!user) {
    if (showLoginPage) {
      return <LoginPage onAuthenticate={handleAuthenticate} onBack={() => setShowLoginPage(false)} />;
    }
    return <Homepage onGetStarted={() => setShowLoginPage(true)} />;
  }

  return (
    <div className="app-layout">
      {/* Main Header (Responsive navbar inside) */}
      <header className="glass-header">
        <div className="header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { if (user) { handleLogout(); } }}>
            <span style={{ fontSize: '24px' }}>🟢</span>
            <div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.3px' }}>
                Pharma Connect
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                {user?.name || 'Guest'} • {role === 'patient' ? 'Patient' : 'Pharmacist'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Menu (Visible on Desktop, Hidden on Mobile) */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {role === 'patient' ? (
              <>
                <button 
                  onClick={() => setPatientTab('search')} 
                  className={`desktop-nav-item ${patientTab === 'search' ? 'desktop-nav-item-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Discover
                </button>
                <button 
                  onClick={() => setPatientTab('cart')} 
                  className={`desktop-nav-item ${patientTab === 'cart' ? 'desktop-nav-item-active' : ''}`}
                  style={{ position: 'relative' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline' }}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  Cart
                  {cartItemCount > 0 && (
                    <span className="cart-floating-badge" style={{ position: 'relative', top: '-1px', right: '-4px', display: 'inline-flex' }}>{cartItemCount}</span>
                  )}
                </button>
                <button 
                  onClick={() => setPatientTab('orders')} 
                  className={`desktop-nav-item ${patientTab === 'orders' ? 'desktop-nav-item-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline' }}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                  Tracking
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setAdminTab('dashboard')} 
                  className={`desktop-nav-item ${adminTab === 'dashboard' ? 'desktop-nav-item-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  Analytics
                </button>
                <button 
                  onClick={() => setAdminTab('orders')} 
                  className={`desktop-nav-item ${adminTab === 'orders' ? 'desktop-nav-item-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Orders
                </button>
                <button 
                  onClick={() => setAdminTab('inventory')} 
                  className={`desktop-nav-item ${adminTab === 'inventory' ? 'desktop-nav-item-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  Inventory
                </button>
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                className="role-btn"
                style={{ padding: '6px 10px' }}
              >
                {theme === 'light' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                )}
              </button>

              <button 
                onClick={handleResetDb} 
                title="Reset Database" 
                className="role-btn"
                style={{ padding: '6px 10px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', display: 'inline' }}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
                Reset
              </button>

              <button 
                onClick={handleLogout} 
                title="Logout"
                className="role-btn"
                style={{ padding: '6px 10px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', display: 'inline' }}><path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"></path><polyline points="17 16 21 12 17 8"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main View Port Container */}
      <main className="main-content">
        {role === 'patient' ? (
          <PatientFlow
            activeTab={patientTab}
            setActiveTab={setPatientTab}
            cart={cart}
            setCart={setCart}
          />
        ) : (
          <AdminFlow
            activeTab={adminTab}
            setActiveTab={setAdminTab}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (Visible on Mobile, Hidden on Desktop) */}
      <nav className="bottom-nav">
        {role === 'patient' ? (
          <>
            <button 
              onClick={() => setPatientTab('search')} 
              className={`bottom-nav-item ${patientTab === 'search' ? 'bottom-nav-item-active' : ''}`}
            >
              <div className="bottom-nav-icon-container">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <span>Discover</span>
            </button>

            <button 
              onClick={() => setPatientTab('cart')} 
              className={`bottom-nav-item ${patientTab === 'cart' ? 'bottom-nav-item-active' : ''}`}
            >
              <div className="bottom-nav-icon-container">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartItemCount > 0 && (
                  <span className="cart-floating-badge">{cartItemCount}</span>
                )}
              </div>
              <span>Cart</span>
            </button>

            <button 
              onClick={() => setPatientTab('orders')} 
              className={`bottom-nav-item ${patientTab === 'orders' ? 'bottom-nav-item-active' : ''}`}
            >
              <div className="bottom-nav-icon-container">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
              </div>
              <span>Tracking</span>
            </button>

            <button 
              onClick={handleLogout} 
              className="bottom-nav-item"
              title="Logout"
            >
              <div className="bottom-nav-icon-container">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"></path>
                  <polyline points="17 16 21 12 17 8"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setAdminTab('dashboard')} 
              className={`bottom-nav-item ${adminTab === 'dashboard' ? 'bottom-nav-item-active' : ''}`}
            >
              <div className="bottom-nav-icon-container">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <span>Analytics</span>
            </button>

            <button 
              onClick={() => setAdminTab('orders')} 
              className={`bottom-nav-item ${adminTab === 'orders' ? 'bottom-nav-item-active' : ''}`}
            >
              <div className="bottom-nav-icon-container">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span>Orders</span>
            </button>

            <button 
              onClick={() => setAdminTab('inventory')} 
              className={`bottom-nav-item ${adminTab === 'inventory' ? 'bottom-nav-item-active' : ''}`}
            >
              <div className="bottom-nav-icon-container">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                  <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"></polygon>
                  <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08"></polygon>
                  <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12"></polygon>
                </svg>
              </div>
              <span>Inventory</span>
            </button>

            <button 
              onClick={handleLogout} 
              className="bottom-nav-item"
              title="Logout"
            >
              <div className="bottom-nav-icon-container">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"></path>
                  <polyline points="17 16 21 12 17 8"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <span>Logout</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}

export default App;
