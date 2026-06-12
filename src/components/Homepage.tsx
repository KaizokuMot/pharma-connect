import React from 'react';
import "./Hompage.css"

interface HomepageProps {
  onGetStarted: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onGetStarted }) => {
  return (
    <div style={{backgroundColor: "var(--bg-dark)"}} className="app-layout mdx-layout-right">
        {/* bg section */}
       <div className='mdx-left'> pc-beta 0.2.0</div>

{/* rightSEction */}
      <div style={{
        
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 20px',
        background: 'transparent'
      }}>
    <div className='mdx-right' style={{ maxWidth: '750px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 30px)',
            fontWeight: 700,
            margin: '0 0 16px 0',
            color: 'var(--text-primary)',
            letterSpacing: '-1.2px'
          }}>
            PHARMA CONNECT
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            margin: '0 0 12px 0',
            fontWeight: 500
          }}>
            Kampala District Digital Pharmacy Network
          </p>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            // margin: '0 0 48px 0',
            lineHeight: '1.8',
            maxWidth: '650px',
            margin: '0 auto 48px auto'
          }}>
            An integrated pharmaceutical delivery platform connecting patients with pharmacies. Real-time order tracking, digital prescriptions, and efficient logistics across Kampala.
          </p>
          <div className='home_actions'>
        <button

        style={{color: "var(--bg-light)", padding: "16px 56px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease"}}
          onClick={onGetStarted}
          className='get-started-btn'
        >
          Get Started
        </button>

          <button
            onClick={onGetStarted}
            style={{
              color: 'var(--bg-light)',
              padding: '16px 56px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: 'transparent',
              border:"none",
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              cursor: 'pointer',
            }}
       
     
          >
            Launch App
          </button>
</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
            Pilot Phase • Kampala District • 2026
          </p>
        </div>
      </div>
   
    </div>
  );
};
