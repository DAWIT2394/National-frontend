import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ButcherPage from './components/ButcherPage';
import Adminpage from './components/Adminpage';
import ReportPage from './components/ReportPage';
import Cooker from './components/CookerPage';
import LoginPage from './components/LoginPage';
import AdminCreateUser from './components/AdminCreateUser'; 
import { AllComponents } from './components/all';
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />

          <Route path="/AdminCreateUser" element={<AdminCreateUser />} />
          <Route path="/AllComponents" element={<AllComponents />} />

          <Route path="/ButcherPage" element={<ButcherPage />} />
          <Route path="/admin" element={<Adminpage />} />
          <Route path="/ReportPage" element={<ReportPage />} />
          <Route path="/CookerPage" element={<Cooker />} />


        </Routes>
      </Router>
    </div>
  );
}

export default App;
