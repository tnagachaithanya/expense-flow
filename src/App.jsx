import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AddTransaction } from './components/AddTransaction';
import { TabNavigation } from './components/TabNavigation';
import { TransactionPage } from './pages/TransactionPage';
import { Budget } from './pages/Budget';
import { Reports } from './pages/Reports';
import { Family } from './pages/Family';
import { Settings } from './pages/Settings';
import { ThemeManager } from './utils/ThemeManager';
import { GlobalProvider } from './context/GlobalState';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login.jsx';
import './App.css';

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = ThemeManager.getTheme();
    ThemeManager.applyTheme(savedTheme);
  }, []);

  return (
    <AuthProvider>
      <GlobalProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <Header />
          <div className="app-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/transactions" element={<PrivateRoute><TransactionPage /></PrivateRoute>} />
              <Route path="/add" element={<PrivateRoute><AddTransaction /></PrivateRoute>} />
              <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Route path="/family" element={<PrivateRoute><Family /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            </Routes>
          </div>
          <TabNavigation />
        </Router>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;
