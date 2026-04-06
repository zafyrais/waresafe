import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface SensorData {
  data_id: number;
  sensor_id: number;
  value: string;
  timestamp: string;
}

function App() {
  // --- STATE ---
  // The switch to track if we are on the Login page or Dashboard
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeEmail, setActiveEmail] = useState('');
  
  // Buckets for the login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Bucket for the dashboard data
  const [readings, setReadings] = useState<SensorData[]>([]);

  // --- FETCH DATA (Only runs once when the app starts) ---
  useEffect(() => {
    fetch('http://localhost:8000/api/sensor-data')
      .then(response => response.json())
      .then(data => setReadings(data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  // --- ACTIONS ---
  // --- ACTIONS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing
    
    try {
      // 1. Send the email and password to the Laravel Librarian
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
      });

      // 2. Read the Librarian's answer
      const data = await response.json();

      // 3. If Laravel says success is true, flip the switch!
      if (data.success) {
        setActiveEmail(email); // Save the email so we know who to log out later!
        setIsLoggedIn(true);
        setEmail('');
        setPassword('');
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Network error during login:", error);
      alert("Could not connect to the server.");
    }
  };

  // NEW: The Logout Action
  const handleLogout = async () => {
    try {
      // 1. Tell the Librarian to log this specific email out
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: activeEmail })
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      // 2. No matter what, flip the switch back to the login screen
      setIsLoggedIn(false);
      setActiveEmail(''); // Clear the memory
    }
  };

  // ==========================================
  // PAGE 1: THE LOGIN SCREEN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ backgroundColor: '#fafafa' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
          
          <h2 className="text-center fw-bold mb-5" style={{ fontSize: '2rem' }}>WareSafe</h2>

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="mb-3">
              <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>Email</label>
              <input
                type="email"
                className="form-control form-control-lg shadow-sm border-0"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: '0.95rem', borderRadius: '10px' }}
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>Password</label>
              <div className="input-group shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                <input
                  type="password"
                  className="form-control form-control-lg border-0"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ fontSize: '0.95rem' }}
                  required
                />
                <span className="input-group-text bg-white border-0" style={{ cursor: 'pointer' }}>
                  {/* Simple Unicode Eye Icon matching your design */}
                  👁️
                </span>
              </div>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              className="btn w-100 fw-bold shadow-sm"
              style={{ backgroundColor: '#f2e3e4', color: '#000', borderRadius: '10px', padding: '12px' }}
            >
              Log in
            </button>
          </form>

          {/* Divider */}
          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" />
            <span className="mx-3 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Or</span>
            <hr className="flex-grow-1" />
          </div>

          {/* Footer Text */}
          <div className="text-center fw-bold" style={{ fontSize: '0.9rem' }}>
            <span className="text-muted">Don't have an account? </span>
            {/* Notice this is just a <span>, not an <a> link, so it stays inactive! */}
            <span style={{ color: '#4a81d4' }}>Contact Admin</span>
          </div>

        </div>
      </div>
    );
  }

  

  // ==========================================
  // PAGE 2: THE DASHBOARD SCREEN
  // ==========================================
  const totalReadings = readings.length;
  const latestValue = readings.length > 0 ? readings[0].value : "Loading...";

  return (
    <div className="container mt-5">
      {/* Header with Logout Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-primary fw-bold">WareSafe Dashboard</h1>
          <p className="text-muted">Live Security & Sensor Monitoring</p>
        </div>
        <button 
          className="btn btn-outline-danger shadow-sm fw-bold"
          onClick={handleLogout} // Changed this to use our new function!
        >
          Log Out
        </button>
      </div>

      {/* At-A-Glance Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Total Data Logs</h5>
              <h2 className="display-5 fw-bold">{totalReadings}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">System Status</h5>
              <h2 className="display-5 fw-bold">Secure</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-info shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Latest Reading</h5>
              <h2 className="display-5 fw-bold">{latestValue}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* The Data Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Recent Sensor Activity</h5>
          <table className="table table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Record ID</th>
                <th>Sensor ID</th>
                <th>Reading / Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => (
                <tr key={reading.data_id}>
                  <td>{reading.data_id}</td>
                  <td>
                    <span className="badge bg-secondary">Sensor {reading.sensor_id}</span>
                  </td>
                  <td className="fw-bold">{reading.value}</td>
                  <td className="text-muted">{new Date(reading.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;