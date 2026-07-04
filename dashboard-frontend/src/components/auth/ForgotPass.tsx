// ForgotPass.tsx
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ForgotPassProps {
  onBackToLogin: () => void;
}

function ForgotPass({ onBackToLogin }: ForgotPassProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div
        className="card border-0 shadow-sm rounded-3 p-4"
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <div className="card-body">

          <h3 className="fw-bold text-center mb-1">Forgot Password</h3>
          <p className="text-muted text-center mb-4">
            Enter your email and we'll send you a reset link.
          </p>

          {submitted ? (
            <div className="text-center">
              <div className="alert alert-success">
                If an account with that email exists, a reset link has been sent.
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary mt-2"
                onClick={onBackToLogin}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 fw-semibold"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none small"
                  onClick={onBackToLogin}
                >
                  ← Back to Login
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default ForgotPass;