
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setSuccess(
          'Your account has been created. Please check your email for a confirmation link before signing in.'
        );
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">

        <section className="auth-brand-panel">
          <Link to="/register" className="auth-brand">
            <span className="auth-brand-icon">
              <i className="bi bi-check2"></i>
            </span>
            <span>daymark</span>
          </Link>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">A BETTER WAY TO STAY ORGANISED</span>

            <h1>Start with a plan. <span>Grow with progress.</span></h1>

            <p>
              Create your personal workspace, organise your
              responsibilities and take control of your day,
              one task at a time.
            </p>

            <div className="auth-feature-list">
              <div>
                <i className="bi bi-check-circle-fill"></i>
                <span>One space for all your tasks</span>
              </div>
              <div>
                <i className="bi bi-check-circle-fill"></i>
                <span>Simple productivity tracking</span>
              </div>
              <div>
                <i className="bi bi-check-circle-fill"></i>
                <span>A clearer view of your goals</span>
              </div>
            </div>
          </div>

          <p className="auth-brand-footer">
            Your next productive day starts here.
          </p>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">

            <div className="auth-mobile-brand">
              <span className="auth-brand-icon">
                <i className="bi bi-check2"></i>
              </span>
              <span>daymark</span>
            </div>

            <div className="auth-heading">
              <span className="auth-form-eyebrow">GET STARTED</span>
              <h2>Create your account</h2>
              <p>Set up your workspace in just a few steps.</p>
            </div>

            {error && (
              <div className="auth-alert auth-alert-error" role="alert">
                <i className="bi bi-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert auth-alert-success" role="status">
                <i className="bi bi-check-circle"></i>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="auth-field">
                <label htmlFor="register-name">Full name</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-person"></i>
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="register-email">Email address</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-envelope"></i>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="register-password">Password</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-lock"></i>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                <small className="auth-field-hint">
                  Use at least 6 characters.
                </small>
              </div>

              <div className="auth-field">
                <label htmlFor="register-confirm-password">Confirm password</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-shield-lock"></i>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?
              <Link to="/login">Sign in</Link>
            </div>

            <p className="auth-legal">
              Your account information is securely managed
              through Supabase authentication.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}

export default Register;
