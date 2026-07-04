// src/pages/Office.tsx
import type { SensorData, AlertData } from '../types.ts';
import { getSensorStatus, getStatusColor } from '../services/sensorService.ts';

interface OfficeProps {
  officeSensors: SensorData[];
  officeAlerts: AlertData[];
}

function Office({ officeSensors, officeAlerts }: OfficeProps) {
  return (
    <div className="p-5">
      <h2 className="fw-bold mb-4">Office Monitoring | Area A</h2>

      {/* OFFICE SENSOR DATA */}
      <div className="card p-3 mb-4">
        <h5>Office Sensor Data</h5>
        <p className="text-muted mb-3">PIR Motion, Door Reed, and Vibration Sensor.</p>

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

      {/* VIBRATION / BUZZER ALERTS */}
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
  );
}

export default Office;