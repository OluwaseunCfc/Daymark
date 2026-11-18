
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, setRememberMePreference } from '../lib/supabase';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      setRememberMePreference(rememberMe);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">

        {/* Branding Panel */}
        <div className="auth-brand-panel">

          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">
              <i className="bi bi-check-lg"></i>
            </div>
            <span>Daymark</span>
          </Link>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">YOUR PRODUCTIVITY SPACE</span>

            <h1>
              Make every day <span>count.</span>
            </h1>

            <p>
              Organise your tasks, stay focused, and make meaningful
              progress towards your goals.
            </p>

            <div className="auth-feature-list">
              <div>
                <i className="bi bi-check-circle-fill"></i>
                <span>Organise your daily tasks</span>
              </div>

              <div>
                <i className="bi bi-check-circle-fill"></i>
                <span>Track your productivity</span>
              </div>

              <div>
                <i className="bi bi-check-circle-fill"></i>
                <span>Stay focused on what matters</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            Your productivity, made simple.
          </div>

        </div>

        {/* Login Form */}
        <div className="auth-form-panel">
          <div className="auth-form-container">

            <div className="auth-mobile-brand">
              <div className="auth-brand-icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <span>Daymark</span>
            </div>

            <div className="auth-heading">
              <h2>Welcome back</h2>
              <p>Enter your details to access your account.</p>
            </div>

            {error && (
              <div className="auth-alert auth-alert-error">
                <i className="bi bi-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="email">Email address</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-envelope"></i>

                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="auth-input-wrapper">
                  <i className="bi bi-lock"></i>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i
                      className={`bi ${
                        showPassword ? 'bi-eye-slash' : 'bi-eye'
                      }`}
                    ></i>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="auth-remember-row">
                <label className="auth-remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />

                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>

            </form>

            <div className="auth-switch">
              <span>Don't have an account?</span>
              <Link to="/register">Create an account</Link>
            </div>

            <p className="auth-legal">
              © {new Date().getFullYear()} Daymark. All rights reserved.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
