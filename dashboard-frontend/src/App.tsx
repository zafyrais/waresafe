import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- INTERFACES ---
interface SensorData {
  data_id: number;
  sensor_id: number;
  sensor_type: string;
  device_type: string;
  zone_name?: string;
  value: string;
  timestamp: string;
}

interface AlertData {
  alert_id: number;
  alert_type: string;
  sensor_type?: string;
  device_type?: string;
  zone_name?: string;
  timestamp: string;
}

interface AttackRecord {
  alert_id: number;
  sensor_type: string;
  device_type: string;
  zone_name: string;
  attack_type: string;
  timestamp: string;
}

function App() {
  // --- STATE: AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('wareSafeLoggedIn') === 'true');
  const [activeEmail, setActiveEmail] = useState(() => localStorage.getItem('wareSafeEmail') || '');

  // --- STATE: NAVIGATION ---
  const [activePage, setActivePage] = useState('dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Data Buckets
  const [readings, setReadings] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [sensors, setSensors] = useState<AlertData[]>([]);

  // Search state for the Warehouse tables
  const [rfidSearch, setRfidSearch] = useState('');

  // Office / Area A
  const [officeSensors, setOfficeSensors] = useState<SensorData[]>([]);
  const [officeAlerts, setOfficeAlerts] = useState<AlertData[]>([]);

  // Warehouse / Area B
  const [warehouseSensors, setWarehouseSensors] = useState<SensorData[]>([]);
  const [warehouseRfid, setWarehouseRfid] = useState<SensorData[]>([]);
  const [warehouseAlerts, setWarehouseAlerts] = useState<AlertData[]>([]);

  // Search state for Cyber Attack Records
  const [attackRecords, setAttackRecords] = useState<AttackRecord[]>([]);
  const [attackSearch, setAttackSearch] = useState('');

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

    fetch('http://localhost:8000/api/office/sensors')
      .then(res => res.json())
      .then(data => setOfficeSensors(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/office/alerts')
      .then(res => res.json())
      .then(data => setOfficeAlerts(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/warehouse/sensors')
      .then(res => res.json())
      .then(data => setWarehouseSensors(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/warehouse/rfid')
      .then(res => res.json())
      .then(data => setWarehouseRfid(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/warehouse/alerts')
      .then(res => res.json())
      .then(data => setWarehouseAlerts(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/attacks')
      .then(res => res.json())
      .then(data => setAttackRecords(data))
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
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Could not connect to the server.');
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
      setActivePage('dashboard');
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
              <label className="form-label fw-bold text-secondary d-block text-start" style={{ fontSize: '0.9rem', width: '120px' }}>
                Email
              </label>
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

            <div className="mb-4">
              <label className="form-label fw-bold text-secondary d-block text-start" style={{ fontSize: '0.9rem', width: '120px' }}>
                Password
              </label>
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
                <span className="input-group-text bg-white border-0" style={{ cursor: 'pointer' }}>👁️</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 fw-bold shadow-sm"
              style={{ backgroundColor: '#f2e3e4', color: '#000', borderRadius: '10px', padding: '12px' }}
            >
              Log in
            </button>
          </form>

          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" />
            <span className="mx-3 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Or</span>
            <hr className="flex-grow-1" />
          </div>

          <div className="text-center fw-bold" style={{ fontSize: '0.9rem' }}>
            <span className="text-muted">Don't have an account? </span>
            <span style={{ color: '#4a81d4' }}>Contact Admin</span>
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

  // Helper status sensor WareSafe
  const getSensorStatus = (sensorType: string, value: string) => {
    const type = sensorType.toLowerCase();
    const val = value.toLowerCase();

    // Office / Area A - PIR Motion
    if (type.includes('pir') || type.includes('motion')) {
      if (
        val.includes('motion_detected') ||
        val.includes('motion detected') ||
        val.includes('detected') ||
        val.includes('active') ||
        val === '1'
      ) {
        return 'Motion Detected';
      }

      return 'No Motion';
    }

    // Office / Area A and Warehouse / Area B - Door Reed
    if (
      type.includes('reed') ||
      type.includes('door')
    ) {
      if (
        val.includes('open') ||
        val.includes('opened') ||
        val.includes('door_open') ||
        val === '1'
      ) {
        return 'Door Open';
      }

      if (
        val.includes('closed') ||
        val.includes('close') ||
        val.includes('door_closed') ||
        val === '0'
      ) {
        return 'Door Closed';
      }

      return value;
    }

    // Office / Area A - Vibration
    if (
      type.includes('vibration') ||
      type.includes('vibrate')
    ) {
      if (
        val.includes('abnormal') ||
        val.includes('abnormal_vibration') ||
        val.includes('detected') ||
        val.includes('alert') ||
        val === '1'
      ) {
        return 'Abnormal Vibration';
      }

      return 'Normal';
    }

    // Warehouse / Area B - RFID
    if (
      type.includes('rfid') ||
      type.includes('access')
    ) {
      if (
        val.includes('unauthorized') ||
        val.includes('denied') ||
        val.includes('invalid') ||
        val.includes('expired') ||
        val.includes('access_denied')
      ) {
        return 'Unauthorized';
      }

      if (
        val.includes('authorized') ||
        val.includes('granted') ||
        val.includes('valid') ||
        val.includes('access_granted')
      ) {
        return 'Authorized';
      }

      return value;
    }

    // Warehouse / Area B - Alarm Module: LED, buzzer, LCD
    if (
      type.includes('alarm') ||
      type.includes('led') ||
      type.includes('buzzer') ||
      type.includes('lcd')
    ) {
      if (
        val.includes('danger') ||
        val.includes('alert') ||
        val.includes('alarm') ||
        val.includes('red') ||
        val.includes('flood')
      ) {
        return 'Alert';
      }

      if (
        val.includes('warning') ||
        val.includes('yellow')
      ) {
        return 'Warning';
      }

      if (
        val.includes('normal') ||
        val.includes('green') ||
        val.includes('safe')
      ) {
        return 'Normal';
      }

      return value;
    }

    return value;
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (
      normalizedStatus.includes('abnormal') ||
      normalizedStatus.includes('unauthorized') ||
      normalizedStatus.includes('alert') ||
      normalizedStatus.includes('danger') ||
      normalizedStatus.includes('open')
    ) {
      return '#D9534F';
    }

    if (
      normalizedStatus.includes('warning')
    ) {
      return '#F0AD4E';
    }

    return '#2E8B57';
  };

  return (
    <div className="d-flex h-100 w-100" style={{ backgroundColor: '#F8F9FA' }}>

      {/* SIDEBAR */}
      <div className="d-flex flex-column h-100" style={{ width: '250px', backgroundColor: '#F2E3E5', padding: '20px' }}>
        <h2 className="fw-bold mb-4" style={{ marginTop: '10px', textAlign: 'center' }}>WareSafe</h2>

        {/* Navigation Items */}
        <div className="d-flex flex-column gap-2 flex-grow-1 mt-3">

          <div
            className="fw-bold px-3 py-2"
            style={{ backgroundColor: activePage === 'dashboard' ? '#FFFFFF' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </div>

          <div
            className="fw-bold px-3 py-2"
            style={{ backgroundColor: activePage === 'warehouse' ? '#FFFFFF' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => setActivePage('warehouse')}
          >
            Warehouse
          </div>

          <div
            className="fw-bold px-3 py-2"
            style={{ backgroundColor: activePage === 'office' ? '#FFFFFF' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => setActivePage('office')}
          >
            Office
          </div>

          <div
            className="fw-bold px-3 py-2"
            style={{ backgroundColor: activePage === 'education' ? '#FFFFFF' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => setActivePage('education')}
          >
            Mitigation Education
          </div>

          <div
            className="fw-bold px-3 py-2"
            style={{ backgroundColor: activePage === 'attacks' ? '#FFFFFF' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => setActivePage('attacks')}
          >
            Cyber Attack Records
          </div>
        </div>

        <div className="fw-bold px-3 py-2 mt-auto d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i> Log Out
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow-1 d-flex flex-column" style={{ overflowY: 'auto' }}>

        {/* Top Header */}
        <div className="d-flex justify-content-between align-items-center px-5 py-3 bg-white shadow-sm" style={{ zIndex: 1 }}>
          <div></div>
          <div className="fw-bold text-dark">{dayString}, {timeString}</div>
          <div style={{ width: '35px', height: '35px', backgroundColor: '#e9ecef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd' }}>
            👤
          </div>
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
            <h2 className="fw-bold mb-4">Warehouse Area / Area B</h2>

            <div className="card p-3 mb-4">
              <h5>RFID Access Data</h5>
              <p className="text-muted mb-3">
                RFID access status connected with warehouse door reed.
              </p>

              <div className="d-flex justify-content-end mb-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search RFID data..."
                  style={{ width: '220px' }}
                  value={rfidSearch}
                  onChange={(e) => setRfidSearch(e.target.value)}
                />
              </div>

              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Sensor</th>
                    <th>Device</th>
                    <th>Access Status</th>
                    <th>Description</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                {warehouseRfid
                  .filter(row =>
                    row.value.toLowerCase().includes(rfidSearch.toLowerCase()) ||
                    row.sensor_id.toString().includes(rfidSearch)
                  )
                  .slice(0, 10)
                  .map((row, index) => {
                    const status = getSensorStatus(row.sensor_type, row.value);

                    return (
                      <tr key={row.data_id}>
                        <td>{index + 1}</td>
                        <td>{row.sensor_type} #{row.sensor_id}</td>
                        <td>{row.device_type}</td>
                        <td style={{ color: getStatusColor(status), fontWeight: 'bold' }}>
                          {status}
                        </td>
                        <td>{row.value}</td>
                        <td>{new Date(row.timestamp).toLocaleString('en-GB')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="card p-3 mb-4">
              <h5>Warehouse Door and Alarm Module Sensor Data</h5>
              <p className="text-muted mb-3">
                Door reed and alarm module: LED green/yellow/red, buzzer, and LCD display I2C.
              </p>

              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Sensor / Component</th>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseSensors.slice(0, 10).map((row, index) => {
                    const status = getSensorStatus(row.sensor_type, row.value);

                    return (
                      <tr key={row.data_id}>
                        <td>{index + 1}</td>
                        <td>{row.sensor_type} #{row.sensor_id}</td>
                        <td>{row.device_type}</td>
                        <td style={{ color: getStatusColor(status), fontWeight: 'bold' }}>
                          {status}
                        </td>
                        <td>{row.value}</td>
                        <td>{new Date(row.timestamp).toLocaleString('en-GB')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="card p-3">
              <h5>Warehouse Alarm Alerts</h5>
              <p className="text-muted mb-3">
                Alert from alarm module: LED, buzzer, and LCD display.
              </p>

              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Alert Type</th>
                    <th>Sensor</th>
                    <th>Device</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseAlerts.slice(0, 10).map((row, index) => (
                    <tr key={row.alert_id}>
                      <td>{index + 1}</td>
                      <td>{row.alert_type}</td>
                      <td>{row.sensor_type || '-'}</td>
                      <td>{row.device_type || '-'}</td>
                      <td>{new Date(row.timestamp).toLocaleString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* DYNAMIC CONTENT: OFFICE VIEW */}
        {/* ----------------------------------------------------------------- */}
        {activePage === 'office' && (
          <div className="p-5">
            <h2 className="fw-bold mb-4">Office Area / Area A</h2>

            <div className="card p-3 mb-4">
              <h5>Office Sensor Data</h5>
              <p className="text-muted mb-3">
                PIR Motion, Door Reed, and Vibration Sensor.
              </p>

              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Sensor</th>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {officeSensors.slice(0, 10).map((row, index) => {
                    const status = getSensorStatus(row.sensor_type, row.value);

                    return (
                      <tr key={row.data_id}>
                        <td>{index + 1}</td>
                        <td>{row.sensor_type} #{row.sensor_id}</td>
                        <td>{row.device_type}</td>
                        <td style={{ color: getStatusColor(status), fontWeight: 'bold' }}>
                          {status}
                        </td>
                        <td>{row.value}</td>
                        <td>{new Date(row.timestamp).toLocaleString('en-GB')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="card p-3">
              <h5>Vibration Alert / Buzzer Alert</h5>
              <p className="text-muted mb-3">
                Alert ini berasal dari vibration sensor. Buzzer hanya berfungsi sebagai output alert dari vibration.
              </p>

              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Alert Type</th>
                    <th>Sensor</th>
                    <th>Device</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {officeAlerts.slice(0, 10).map((row, index) => (
                    <tr key={row.alert_id}>
                      <td>{index + 1}</td>
                      <td>{row.alert_type}</td>
                      <td>{row.sensor_type || '-'}</td>
                      <td>{row.device_type || '-'}</td>
                      <td>{new Date(row.timestamp).toLocaleString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* DYNAMIC CONTENT: MITIGATION EDUCATION VIEW */}
        {/* ----------------------------------------------------------------- */}
        {activePage === 'education' && (
          <div className="p-5">
            <h2 className="fw-bold mb-4">Mitigation Education</h2>

            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body p-4">
                <div className="fw-bold text-dark" style={{ backgroundColor: '#f2f2f2', padding: '15px 20px', borderRadius: '5px', marginBottom: '15px' }}>
                  Module A
                </div>
                <p className="mb-0 text-dark fw-bold" style={{ paddingLeft: '5px' }}>
                  Simulation training module of scenario A
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body p-4">
                <div className="fw-bold text-dark" style={{ backgroundColor: '#f2f2f2', padding: '15px 20px', borderRadius: '5px', marginBottom: '15px' }}>
                  Module B
                </div>
                <p className="mb-0 text-dark fw-bold" style={{ paddingLeft: '5px' }}>
                  Simulation training module of scenario B
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body p-4">
                <div className="fw-bold text-dark" style={{ backgroundColor: '#f2f2f2', padding: '15px 20px', borderRadius: '5px', marginBottom: '15px' }}>
                  Module C
                </div>
                <p className="mb-0 text-dark fw-bold" style={{ paddingLeft: '5px' }}>
                  Simulation training module of scenario C
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* DYNAMIC CONTENT: CYBER ATTACK RECORDS VIEW */}
        {/* ----------------------------------------------------------------- */}
        {activePage === 'attacks' && (
          <div className="p-5">
            <h2 className="fw-bold mb-4">Cyber Attack Records</h2>

            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body px-4 py-4">

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <select className="form-select form-select-sm me-2" style={{ width: '70px' }}>
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    <span>entries per page</span>
                  </div>

                  <div className="d-flex align-items-center">
                    <span className="me-2 fw-bold">Search:</span>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ width: '200px' }}
                      value={attackSearch}
                      onChange={(e) => setAttackSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle">
                    <thead style={{ backgroundColor: '#fafafa' }}>
                      <tr>
                        <th className="py-3">No</th>
                        <th className="py-3">Sensor</th>
                        <th className="py-3">Device</th>
                        <th className="py-3">Area</th>
                        <th className="py-3">Attack Type</th>
                        <th className="py-3">Timestamp</th>
                      </tr>
                    </thead>

                    <tbody>
                      {attackRecords
                        .filter(record =>
                          record.attack_type.toLowerCase().includes(attackSearch.toLowerCase()) ||
                          record.zone_name.toLowerCase().includes(attackSearch.toLowerCase()) ||
                          record.sensor_type.toLowerCase().includes(attackSearch.toLowerCase()) ||
                          record.device_type.toLowerCase().includes(attackSearch.toLowerCase())
                        )
                        .slice(0, 10)
                        .map((row, index) => (
                          <tr key={row.alert_id}>
                            <td>{index + 1}</td>
                            <td>{row.sensor_type}</td>
                            <td>{row.device_type}</td>
                            <td>{row.zone_name}</td>
                            <td>{row.attack_type}</td>
                            <td>{new Date(row.timestamp).toLocaleString('en-GB')}</td>
                          </tr>
                        ))}
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