
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleRegister(e) {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      navigate('/dashboard', { replace: true });
    } else {
      setSuccess(
        'Account created! Please check your email for a confirmation link before logging in.'
      );
    }
  }

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="card shadow-sm border-0 p-4 w-100" style={{ maxWidth: '450px' }}>

        <div className="text-center mb-4">
          <h2 className="fw-bold">Create your account</h2>
          <p className="text-muted">
            Start managing your productivity with Daymark.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>

          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 py-2"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <p className="text-center mt-4 mb-0">
          Already have an account?{' '}
          <Link to="/login" className="text-success fw-semibold">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
