import { useState, useEffect } from 'react';
import Login from './components/Login';
import Tracker from './components/Tracker';
import './index.css';

function App() {
  const [userPhone, setUserPhone] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedPhone = localStorage.getItem('geo_tracker_user');
    if (storedPhone) {
      setUserPhone(storedPhone);
    }
  }, []);

  const handleLogin = (phone) => {
    localStorage.setItem('geo_tracker_user', phone);
    setUserPhone(phone);
  };

  const handleLogout = () => {
    localStorage.removeItem('geo_tracker_user');
    setUserPhone(null);
  };

  return (
    <div className="app-container fade-in">
      {!userPhone ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Tracker userPhone={userPhone} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
