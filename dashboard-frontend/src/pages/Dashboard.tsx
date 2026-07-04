// src/pages/Dashboard.tsx
import type { SensorData } from '../types.ts';

interface DashboardProps {
  currentTime: Date;
  officeSensors: SensorData[];
  warehouseDoor: SensorData[];
  totalAttackLogs: number;
}

function Dashboard({ currentTime, officeSensors, warehouseDoor, totalAttackLogs }: DashboardProps) {
  const dayString = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const timeString = currentTime.toLocaleTimeString('en-US');

  return (
    <div className="p-5">
      <h2 className="fw-bold mb-1">Dashboard Monitoring</h2>
      <p className="text-muted mb-4">{dayString} — {timeString}</p>

      {/* SUMMARY CARDS */}
      <div className="row mb-4">

        {/* OFFICE */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-2">
            <div className="card-body">
              <p className="fw-bold text-dark mb-1">Total Office Sensors</p>
              <h2 className="fw-bold" style={{ color: '#2E8B57' }}>
                {officeSensors.length}
              </h2>
              <small className="text-muted">Office Area Monitoring</small>
            </div>
          </div>
        </div>

        {/* WAREHOUSE */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-2">
            <div className="card-body">
              <p className="fw-bold text-dark mb-1">Total Warehouse Sensors</p>
              {/* <h2 className="fw-bold" style={{ color: '#0275D8' }}>
                {warehouseDoor.length}
              </h2> */}
              <small className="text-muted">Warehouse Area Monitoring</small>
            </div>
          </div>
        </div>

        {/* ATTACK LOGS */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-2">
            <div className="card-body">
              <p className="fw-bold text-dark mb-1">Total Attack Logs</p>
              <h2 className="fw-bold" style={{ color: '#D9534F' }}>
                {totalAttackLogs}
              </h2>
              <small className="text-muted">Cybersecurity Simulation Logs</small>
            </div>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-2">
            <div className="card-body">
              <p className="fw-bold text-dark mb-1">System Status</p>
              <h2 className="fw-bold" style={{ color: '#5CB85C' }}>ACTIVE</h2>
              <small className="text-muted">MQTT & Monitoring Running</small>
            </div>
          </div>
        </div>

      </div>

      {/* LATEST OFFICE ACTIVITY */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body">
          <h5 className="fw-bold text-dark mb-4">Latest Office Sensor Activity</h5>
          {officeSensors.slice(0, 5).map((sensor: SensorData) => (
            <div key={sensor.data_id} className="border rounded p-3 mb-3">
              <p className="mb-1"><strong>Area:</strong> Office</p>
              <p className="mb-1"><strong>Sensor:</strong> {sensor.sensor_type}</p>
              <p className="mb-1"><strong>Value:</strong> {sensor.value}</p>
              <p className="mb-0 text-muted">{sensor.timestamp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* LATEST WAREHOUSE ACTIVITY */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <h5 className="fw-bold text-dark mb-4">Latest Warehouse Sensor Activity</h5>
          {warehouseDoor.slice(0, 5).map((sensor: SensorData) => (
            <div key={sensor.data_id} className="border rounded p-3 mb-3">
              <p className="mb-1"><strong>Area:</strong> Warehouse</p>
              <p className="mb-1"><strong>Sensor:</strong> {sensor.sensor_type}</p>
              <p className="mb-1"><strong>Value:</strong> {sensor.value}</p>
              <p className="mb-0 text-muted">{sensor.timestamp}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;