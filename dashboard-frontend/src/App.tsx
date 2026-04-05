import { useEffect, useState } from 'react';

// We tell TypeScript what our data looks like so it doesn't panic
interface SensorData {
  data_id: number;
  sensor_id: number;
  value: string;
  timestamp: string;
}

function App() {
  // Create an empty "bucket" to hold our sensor readings
  const [readings, setReadings] = useState<SensorData[]>([]);

  // The trigger that asks the Laravel Librarian for the data
  useEffect(() => {
    fetch('http://localhost:8000/api/sensor-data')
      .then(response => response.json()) // The Librarian hands over the JSON
      .then(data => setReadings(data))   // We dump it into our React bucket
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="container mt-5">
      {/* A simple Bootstrap Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="text-primary fw-bold">WareSafe Dashboard</h1>
          <p className="text-muted">Live Security & Sensor Monitoring</p>
        </div>
      </div>

      {/* The Bootstrap Data Table */}
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
              {/* We loop through the bucket and create a table row for each reading */}
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