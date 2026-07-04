// Login.tsx
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface LoginProps {
  handleLogin: (e: React.FormEvent, email: string, password: string) => Promise<void>;
  goToForgotPassword: () => void;
  goToRegister: () => void;
}

function Login({ handleLogin, goToForgotPassword, goToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    handleLogin(e, email, password);
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

          <h3 className="fw-bold text-center mb-1">WareSafe</h3>
          <p className="text-muted text-center mb-4">Sign in to your account</p>

          <form onSubmit={onSubmit}>

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-end mb-3">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small"
                onClick={goToForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 fw-semibold"
            >
              Login
            </button>

          </form>

          <hr className="my-4" />

          <p className="text-center mb-0 small">
            Don't have an account?{' '}
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={goToRegister}
            >
              Register here
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;