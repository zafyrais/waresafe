// Register.tsx
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface RegisterProps {
  onBackToLogin: () => void;
}

function Register({ onBackToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! Please log in.');
        onBackToLogin();
      } else {
        alert('Registration failed: ' + data.message);
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
        style={{ width: '100%', maxWidth: '460px' }}
      >
        <div className="card-body">

          <h3 className="fw-bold text-center mb-1">Create Account</h3>
          <p className="text-muted text-center mb-4">Register to access WareSafe</p>

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 fw-semibold"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

          </form>

          <hr className="my-4" />

          <p className="text-center mb-0 small">
            Already have an account?{' '}
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={onBackToLogin}
            >
              Back to Login
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;