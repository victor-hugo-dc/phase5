import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import Search from './pages/Search';
// import UserDashboard from './pages/UserDashboard';
// import HostPage from './pages/HostPage';
import PropertyPage from './pages/PropertyPage';
// import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/search" element={<Search />} /> */}
        {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
        {/* <Route path="/host/:hostId" element={<HostPage />} /> */}
        <Route path="/property/:id" element={<PropertyPage />} />
      </Routes>
    </div>
  );
}

export default App;
