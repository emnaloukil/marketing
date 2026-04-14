import React from 'react';

export default function TestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #FFF9F4 0%, #F8F7FF 100%)',
      fontFamily: "'Nunito', sans-serif",
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
        opacity: 0.2,
        marginBottom: '20px'
      }} />
      <h1 style={{
        fontFamily: "'Baloo 2', cursive",
        fontSize: '2rem',
        color: '#7C3AED',
        fontWeight: 800,
        margin: '0 0 16px 0'
      }}>
        EduKids Test Page
      </h1>
      <p style={{
        color: '#9E99B8',
        fontWeight: 600,
        margin: '0 0 24px 0'
      }}>
        Si vous voyez cette page, React fonctionne correctement !
      </p>
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <a
          href="/"
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: '#7C3AED',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          ← Retour à l'accueil
        </a>
        <a
          href="/student/dashboard"
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: '#10B981',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          Test Dashboard Étudiant
        </a>
      </div>
    </div>
  );
}