// src/pages/Attacks.tsx
import { useState } from 'react';
import type { AttackRecord } from '../types.ts';

interface AttacksProps {
  attackRecords: AttackRecord[];
}

function Attacks({ attackRecords }: AttacksProps) {
  const [attackSearch, setAttackSearch] = useState('');

  const filtered = attackRecords.filter(record =>
    record.attack_type.toLowerCase().includes(attackSearch.toLowerCase()) ||
    record.zone_name.toLowerCase().includes(attackSearch.toLowerCase()) ||
    record.sensor_type.toLowerCase().includes(attackSearch.toLowerCase()) ||
    record.device_type.toLowerCase().includes(attackSearch.toLowerCase())
  );

  return (
    <div className="p-5">
      <h2 className="fw-bold mb-4">Cyber Attack Records</h2>

      <div className="card border-0 shadow-sm rounded-3 mb-4">

        <div className="alert alert-info mb-0 rounded-bottom-0">
          <h5>Purpose of Mitigation Education</h5>
          <p className="mb-0">
            This module provides educational information regarding cybersecurity
            threats simulated in WareSafe. Users can learn attack objectives,
            affected components, and recommended mitigation strategies.
          </p>
        </div>

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
                {filtered.slice(0, 10).map((row, index) => (
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
  );
}

export default Attacks;