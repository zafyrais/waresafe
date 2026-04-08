import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- INTERFACES ---
interface SensorData {
  data_id: number;
  sensor_id: number;
  sensor_type: string;
  device_type: string;
  value: string;
  timestamp: string;
}

interface AlertData {
  alert_id: number;
  alert_type: string;
  description: string;
  timestamp: string;
}

function App() {
  // --- STATE: AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('wareSafeLoggedIn') === 'true');
  const [activeEmail, setActiveEmail] = useState(() => localStorage.getItem('wareSafeEmail') || '');
  
  // --- STATE: NAVIGATION ---
  // This new state tracks which page we are currently looking at
  const [activePage, setActivePage] = useState('dashboard');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Data Buckets
  const [readings, setReadings] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [sensors, setSensors] = useState<AlertData[]>([]);
  
  // Search state for the Warehouse tables
  const [rfidSearch, setRfidSearch] = useState('');
  const [warehouseRfid, setWarehouseRfid] = useState<SensorData[]>([]);
  const [officeRfid, setOfficeRfid] = useState<SensorData[]>([]);
  
  // Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- FETCH DATA & CLOCK TICKER ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    fetch('http://localhost:8000/api/sensor-data')
      .then(res => res.json())
      .then(data => setReadings(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/sensors')
      .then(res => res.json())
      .then(data => setSensors(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/warehouse/rfid')
      .then(res => res.json())
      .then(data => setWarehouseRfid(data))
      .catch(err => console.error(err));

      fetch('http://localhost:8000/api/office/rfid')
      .then(res => res.json())
      .then(data => setOfficeRfid(data))
      .catch(err => console.error(err));

    return () => clearInterval(timer);
  }, []);

  // --- ACTIONS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('wareSafeLoggedIn', 'true');
        localStorage.setItem('wareSafeEmail', email);
        setActiveEmail(email);
        setIsLoggedIn(true);
        setEmail('');
        setPassword('');
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: activeEmail })
      });
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('wareSafeLoggedIn');
      localStorage.removeItem('wareSafeEmail');
      setIsLoggedIn(false);
      setActiveEmail('');
      setActivePage('dashboard'); // Reset view on logout
    }
  };

  // ==========================================
  // PAGE 1: THE LOGIN SCREEN 
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ backgroundColor: '#fafafa' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
          <h2 className="text-center fw-bold mb-4" style={{ fontSize: '2rem' }}>WareSafe</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-bold text-secondary d-block text-start" style={{ fontSize: '0.9rem', width: '120px' }}>Email</label>
              <input type="email" className="form-control form-control-lg shadow-sm border-0" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ fontSize: '0.95rem', borderRadius: '10px' }} required />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold text-secondary d-block text-start" style={{ fontSize: '0.9rem', width: '120px' }}>Password</label>
              <div className="input-group shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                <input type="password" className="form-control form-control-lg border-0" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ fontSize: '0.95rem' }} required />
                <span className="input-group-text bg-white border-0" style={{ cursor: 'pointer' }}>👁️</span>
              </div>
            </div>
            <button type="submit" className="btn w-100 fw-bold shadow-sm" style={{ backgroundColor: '#f2e3e4', color: '#000', borderRadius: '10px', padding: '12px' }}>Log in</button>
          </form>
          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" /><span className="mx-3 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Or</span><hr className="flex-grow-1" />
          </div>
          <div className="text-center fw-bold" style={{ fontSize: '0.9rem' }}>
            <span className="text-muted">Don't have an account? </span><span style={{ color: '#4a81d4' }}>Contact Admin</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE 2 & 3: THE MAIN APPLICATION
  // ==========================================
  const dayString = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const timeString = currentTime.toLocaleTimeString('en-US');

  // Math for dashboard
  const totalSensorLogs = readings.length;
  const totalAttackLogs = alerts.length;
  const installedSensors = sensors.length;

  // Filter logic for the Warehouse search bar
  const filteredReadings = readings.filter(reading => 
    reading.value.toLowerCase().includes(rfidSearch.toLowerCase()) || 
    reading.sensor_id.toString().includes(rfidSearch)
  );

  return (
    <div className="d-flex h-100 w-100" style={{ backgroundColor: '#F8F9FA' }}>
      
      {/* SIDEBAR */}
      <div className="d-flex flex-column h-100" style={{ width: '250px', backgroundColor: '#F2E3E5', padding: '20px' }}>
        <h2 className="fw-bold mb-4" style={{ marginTop: '10px', textAlign: 'center'}}>WareSafe</h2>
        
        {/* Navigation Items (Now dynamic!) */}
        <div className="d-flex flex-column gap-2 flex-grow-1 mt-3">
          
          <div 
            className="fw-bold px-3 py-2" 
            style={{ backgroundColor: activePage === 'dashboard' ? '#FFFFFF' : 'transparent', borderRadius: '8px', cursor: 'pointer'}}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </div>
          
          <div 
            className="fw-bold px-3 py-2" 
            style={{ backgroundColor: activePage === 'warehouse' ? '#FFFFFF' : 'transparent', borderRadius: '8px', cursor: 'pointer'}}
            onClick={() => setActivePage('warehouse')}
          >
            Warehouse
          </div>

          <div 
            className="fw-bold px-3 py-2" 
            style={{ backgroundColor: activePage === 'office' ? '#FFFFFF' : 'transparent', borderRadius: '8px', cursor: 'pointer'}}
            onClick={() => setActivePage('office')}
          >
            Office
          </div>

          <div className="fw-bold px-3 py-2" style={{ cursor: 'pointer' }}>Mitigation Education</div>
          <div className="fw-bold px-3 py-2" style={{ cursor: 'pointer' }}>Cyber Attack Records</div>
        </div>

        <div className="fw-bold px-3 py-2 mt-auto d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i> Log Out
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow-1 d-flex flex-column" style={{ overflowY: 'auto' }}>
        
        {/* Top Header (Stays the same on all pages) */}
        <div className="d-flex justify-content-between align-items-center px-5 py-3 bg-white shadow-sm" style={{ zIndex: 1 }}>
          <div></div> 
          <div className="fw-bold text-dark">{dayString}, {timeString}</div>
          <div style={{ width: '35px', height: '35px', backgroundColor: '#e9ecef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd' }}>👤</div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* DYNAMIC CONTENT: DASHBOARD VIEW */}
        {/* ----------------------------------------------------------------- */}
        {activePage === 'dashboard' && (
          <div className="p-5">
            <h2 className="fw-bold mb-4">Dashboard Monitoring</h2>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-3 h-100 p-2">
                  <div className="card-body">
                    <p className="fw-bold text-dark mb-1">Total Data Sensor Logs</p>
                    <h2 className="fw-bold" style={{ color: '#2E8B57' }}>{totalSensorLogs}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-3 h-100 p-2">
                  <div className="card-body">
                    <p className="fw-bold text-dark mb-1">Total Data Attack Logs</p>
                    <h2 className="fw-bold" style={{ color: '#D9534F' }}>{totalAttackLogs}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-3 h-100 p-2">
                  <div className="card-body">
                    <p className="fw-bold text-dark mb-1">Installed Sensors</p>
                    <h2 className="fw-bold" style={{ color: '#0275D8' }}>{installedSensors}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 mb-4" style={{ minHeight: '350px' }}>
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-muted">
                <h5 className="fw-bold text-dark mb-3">RFID RC522 Overview</h5>
                <p>[ Chart Component Will Go Here ]</p>
              </div>
            </div>
            <div className="card border-0 shadow-sm rounded-3" style={{ minHeight: '350px' }}>
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-muted">
                <h5 className="fw-bold text-dark mb-3">Buzzer Sensor Overview</h5>
                <p>[ Chart Component Will Go Here ]</p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* DYNAMIC CONTENT: WAREHOUSE VIEW */}
        {/* ----------------------------------------------------------------- */}
        {activePage === 'warehouse' && (
          <div className="p-5">
            <h2 className="fw-bold mb-4">Warehouse Area</h2>

            {/* RFID DATA TABLE CARD */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              {/* Card Header matching mockup */}
              <div className="card-header border-0 fw-bold" style={{ backgroundColor: '#f2f2f2', padding: '15px 20px', margin: '15px', borderRadius: '5px' }}>
                RFID Reader Sensor Data
              </div>
              
              <div className="card-body px-4">
                {/* Table Controls (Entries per page & Search) */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <select className="form-select form-select-sm me-2" style={{ width: '70px' }}>
                      <option>5</option>
                      <option>10</option>
                      <option>25</option>
                    </select>
                    <span>entries per page</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-2 fw-bold">Search:</span>
                    {/* Live Search Input! */}
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      style={{ width: '200px' }} 
                      value={rfidSearch}
                      onChange={(e) => setRfidSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* The Data Table */}
                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle">
                    <thead style={{ backgroundColor: '#fafafa' }}>
                      <tr>
                        <th className="py-3">No</th>
                        <th className="py-3">Sensor ID</th>
                        <th className="py-3">Device</th>
                        <th className="py-3">Status (?)</th>
                        <th className="py-3">Description</th>
                        <th className="py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouseRfid.filter(reading => 
                        reading.value.toLowerCase().includes(rfidSearch.toLowerCase()) || 
                        reading.sensor_id.toString().includes(rfidSearch)
                      ).slice(0, 5).map((row, index) => (
                        <tr key={row.data_id}>
                          <td>{index + 1}</td>
                          
                          {/* Dynamically pulls "RFID" and the ID */}
                          <td>{row.sensor_type} {row.sensor_id}</td>
                          
                          {/* Dynamically pulls the actual device (e.g., ESP32) */}
                          <td>{row.device_type}</td>
                          
                          {/* Basic logic to show Normal/Abnormal */}
                          <td className="fw-bold" style={{ color: Number(row.value) > 50 ? '#D9534F' : '#2E8B57' }}>
                            {Number(row.value) > 50 ? 'Abnormal' : 'Normal'}
                          </td>
                          
                          {/* Description maps to the raw value as you requested */}
                          <td>{row.value}</td>
                          
                          <td>{new Date(row.timestamp).toLocaleString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BUZZER DATA TABLE CARD (Placeholder to match your mockup) */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-header border-0 fw-bold" style={{ backgroundColor: '#f2f2f2', padding: '15px 20px', margin: '15px', borderRadius: '5px' }}>
                Buzzer Sensor Data
              </div>
              <div className="card-body px-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <select className="form-select form-select-sm me-2" style={{ width: '70px' }}><option>5</option></select>
                    <span>entries per page</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-2 fw-bold">Search:</span>
                    <input type="text" className="form-control form-control-sm" style={{ width: '200px' }} />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle">
                    <thead style={{ backgroundColor: '#fafafa' }}>
                      <tr>
                        <th className="py-3">No</th>
                        <th className="py-3">Sensor ID</th>
                        <th className="py-3">Device ID</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Description</th>
                        <th className="py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} className="text-muted py-4">Waiting for buzzer data integration...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* DYNAMIC CONTENT: OFFICE VIEW */}
        {activePage === 'office' && (
          <div className="p-5">
            <h2 className="fw-bold mb-4">Office Area</h2>

            {/* RFID DATA TABLE CARD */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              {/* Card Header matching mockup */}
              <div className="card-header border-0 fw-bold" style={{ backgroundColor: '#f2f2f2', padding: '15px 20px', margin: '15px', borderRadius: '5px' }}>
                RFID Reader Sensor Data
              </div>
              
              <div className="card-body px-4">
                {/* Table Controls (Entries per page & Search) */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <select className="form-select form-select-sm me-2" style={{ width: '70px' }}>
                      <option>5</option>
                      <option>10</option>
                      <option>25</option>
                    </select>
                    <span>entries per page</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-2 fw-bold">Search:</span>
                    {/* Live Search Input! */}
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      style={{ width: '200px' }} 
                      value={rfidSearch}
                      onChange={(e) => setRfidSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* The Data Table */}
                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle">
                    <thead style={{ backgroundColor: '#fafafa' }}>
                      <tr>
                        <th className="py-3">No</th>
                        <th className="py-3">Sensor ID</th>
                        <th className="py-3">Device</th>
                        <th className="py-3">Status (?)</th>
                        <th className="py-3">Description</th>
                        <th className="py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officeRfid.filter(reading => 
                        reading.value.toLowerCase().includes(rfidSearch.toLowerCase()) || 
                        reading.sensor_id.toString().includes(rfidSearch)
                      ).slice(0, 5).map((row, index) => (
                        <tr key={row.data_id}>
                          <td>{index + 1}</td>
                          
                          {/* Dynamically pulls "RFID" and the ID */}
                          <td>{row.sensor_type} {row.sensor_id}</td>
                          
                          {/* Dynamically pulls the actual device (e.g., ESP32) */}
                          <td>{row.device_type}</td>
                          
                          {/* Basic logic to show Normal/Abnormal */}
                          <td className="fw-bold" style={{ color: Number(row.value) > 50 ? '#D9534F' : '#2E8B57' }}>
                            {Number(row.value) > 50 ? 'Abnormal' : 'Normal'}
                          </td>
                          
                          {/* Description maps to the raw value as you requested */}
                          <td>{row.value}</td>
                          
                          <td>{new Date(row.timestamp).toLocaleString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BUZZER DATA TABLE CARD (Placeholder to match your mockup) */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-header border-0 fw-bold" style={{ backgroundColor: '#f2f2f2', padding: '15px 20px', margin: '15px', borderRadius: '5px' }}>
                Buzzer Sensor Data
              </div>
              <div className="card-body px-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <select className="form-select form-select-sm me-2" style={{ width: '70px' }}><option>5</option></select>
                    <span>entries per page</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-2 fw-bold">Search:</span>
                    <input type="text" className="form-control form-control-sm" style={{ width: '200px' }} />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle">
                    <thead style={{ backgroundColor: '#fafafa' }}>
                      <tr>
                        <th className="py-3">No</th>
                        <th className="py-3">Sensor ID</th>
                        <th className="py-3">Device ID</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Description</th>
                        <th className="py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} className="text-muted py-4">Waiting for buzzer data integration...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;