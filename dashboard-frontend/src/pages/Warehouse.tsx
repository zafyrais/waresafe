// src/pages/Warehouse.tsx
import { useState } from 'react';
import type { SensorData, AlertData } from '../types.ts';
import { getSensorStatus, getStatusColor } from '../services/sensorService.ts';

interface WarehouseProps {
  warehouseDoor: SensorData[];
  warehouseSecurity: SensorData[];
  warehouseRfid: SensorData[];
  warehouseAlerts: AlertData[];
}

function Warehouse({ warehouseDoor, warehouseSecurity, warehouseRfid, warehouseAlerts }: WarehouseProps) {
  const [rfidSearch, setRfidSearch] = useState('');

  return (
    <div className="p-5">
      <h2 className="fw-bold mb-4">Warehouse Area / Area B</h2>

      {/* RFID ACCESS DATA */}
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

      {/* WAREHOUSE DOOR LOGS */}
      <div className="card p-3 mb-4">
        <h5>Warehouse Door Logs</h5>
        <p className="text-muted mb-3">Door reed switch B activity logs.</p>

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
            {warehouseDoor.slice(0, 10).map((row, index) => {
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

      {/* SECURITY DEVICES STATUS */}
      <div className="card p-3 mb-4">
        <h5>Security Devices Status</h5>
        <p className="text-muted mb-3">
          Green LED, Yellow LED, Red LED and Buzzer B activity logs.
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
            {warehouseSecurity.slice(0, 10).map((row, index) => {
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

      {/* WAREHOUSE ALARM ALERTS */}
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
  );
}

export default Warehouse;