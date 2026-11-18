
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      navigate('/dashboard', { replace: true });
    }
  }

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div
        className="card shadow-sm border-0 p-4 w-100"
        style={{ maxWidth: '450px' }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold">Welcome back!</h2>
          <p className="text-muted">
            Sign in to continue to your Daymark workspace.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 py-2"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Don't have an account?{' '}
          <Link to="/register" className="text-success fw-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
