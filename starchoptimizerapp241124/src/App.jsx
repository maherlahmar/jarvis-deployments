import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import useProcessStore from './store/useProcessStore';

function App() {
  const { initializeDarkMode } = useProcessStore();

  useEffect(() => {
    initializeDarkMode();
  }, [initializeDarkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
