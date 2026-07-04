// src/pages/Education.tsx
// Static content — tidak butuh props maupun data fetching.
// Tambahkan modul baru cukup dengan copy-paste blok card di bawah.
function Education() {
  return (
    <div className="p-5">

      {/* HEADER */}
      <div className="d-flex align-items-center mb-4">
        <div
          className="me-3"
          style={{
            width: '55px',
            height: '55px',
            borderRadius: '12px',
            background: '#ffe5e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          🛡️
        </div>
        <div>
          <h2 className="fw-bold mb-1">Cybersecurity Learning Center</h2>
          <p className="text-muted mb-0">
            Learn how common IoT attacks affect the WareSafe monitoring system
            and how to mitigate them.
          </p>
        </div>
      </div>

      {/* MODULE A — REPLAY ATTACK */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">

          <div className="d-flex align-items-center mb-3">
            <div
              className="me-3"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#fff3cd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              🔁
            </div>
            <div>
              <h4 className="fw-bold mb-0">Replay Attack</h4>
              <small className="text-muted">Module A</small>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-danger">🚨 What Happens?</h6>
                <p className="mb-0 small">
                  Attackers resend previously valid PIR motion data, causing the
                  system to believe movement exists when no physical activity
                  actually occurs.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-warning">🎯 Impact</h6>
                <ul className="small mb-0">
                  <li>False motion detection</li>
                  <li>Wasted security response</li>
                  <li>Reduced trust in alerts</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-success">🛡️ Mitigation</h6>
                <ul className="small mb-0">
                  <li>Timestamp validation</li>
                  <li>Unique message ID</li>
                  <li>MQTT authentication</li>
                  <li>CCTV verification</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            className="mt-3 p-3 rounded-3"
            style={{ background: '#eef8ff', borderLeft: '5px solid #0d6efd' }}
          >
            <strong>👨‍🏫 User Awareness:</strong>{' '}
            Repeated motion alerts without physical evidence may indicate a
            replay attack rather than genuine activity.
          </div>

        </div>
      </div>

      {/* Tambahkan Module B, C, dst. di bawah sini dengan format yang sama */}

    </div>
  );
}

export default Education;