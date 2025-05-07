import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Crypto Tracker</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/news">News</Link>
      </div>
    </nav>
  );
}

export default Navbar; 