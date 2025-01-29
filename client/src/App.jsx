import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PropertyPage from './pages/PropertyPage';
import HostPage from './pages/HostPage';

function App() {
  return (
    <div>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyPage />} />
        <Route path="/host/:id" element={<HostPage />} />
      </Routes>
    </div>
  );
}

export default App;
