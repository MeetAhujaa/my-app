import React, { useState } from 'react';
import Home from './components/Home';
import News from './components/News';

function App() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#181818',
        padding: '1rem 0',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <button
          style={{
            background: tab === 'dashboard' ? '#4caf50' : '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '4px 0 0 4px',
            padding: '0.75rem 2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem',
            outline: 'none',
            transition: 'background 0.2s'
          }}
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          style={{
            background: tab === 'news' ? '#4caf50' : '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            padding: '0.75rem 2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem',
            outline: 'none',
            transition: 'background 0.2s'
          }}
          onClick={() => setTab('news')}
        >
          News
        </button>
      </nav>
      {/* Main Content */}
      {tab === 'dashboard' ? <Home /> : <News />}
    </div>
  );
}

export default App;
