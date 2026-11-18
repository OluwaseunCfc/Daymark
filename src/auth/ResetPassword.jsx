
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function checkRecoverySession() {
      const { data, error } = await supabase.auth.getSession();

      if (!error && data.session) {
        setValidSession(true);
      }

      setCheckingSession(false);
    }

    checkRecoverySession();
  }, []);

  async function handleResetPassword(e) {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Your password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess('Your password has been updated successfully.');

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="auth-page">
        <div className="auth-loading">
          <span className="spinner-border"></span>
          <p>Verifying your recovery link...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">

        <section className="auth-brand-panel">
          <Link to="/login" className="auth-brand">
            <span className="auth-brand-icon">
              <i className="bi bi-check2"></i>
            </span>
            <span>daymark</span>
          </Link>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">SECURE YOUR ACCOUNT</span>

            <h1>A new password. A fresh start.</h1>

            <p>
              Choose a strong password to protect your
              Daymark workspace and get back to organising
              what matters.
            </p>
          </div>

          <p className="auth-brand-footer">
            Your productivity journey continues here.
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
              <span className="auth-form-eyebrow">ACCOUNT RECOVERY</span>
              <h2>Set a new password</h2>
              <p>
                Create a new password for your Daymark account.
              </p>
            </div>

            {!validSession ? (
              <>
                <div className="auth-alert auth-alert-error">
                  <i className="bi bi-exclamation-circle"></i>
                  <span>
                    This recovery link is invalid or has expired.
                    Please request a new one.
                  </span>
                </div>

                <Link
                  to="/forgot-password"
                  className="auth-submit-btn auth-submit-link"
                >
                  Request a new recovery link
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </>
            ) : (
              <>
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

                <form onSubmit={handleResetPassword}>
                  <div className="auth-field">
                    <label htmlFor="new-password">New password</label>

                    <div className="auth-input-wrapper">
                      <i className="bi bi-lock"></i>
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
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
                    <label htmlFor="confirm-new-password">
                      Confirm new password
                    </label>

                    <div className="auth-input-wrapper">
                      <i className="bi bi-shield-lock"></i>
                      <input
                        id="confirm-new-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Enter your new password again"
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
                    disabled={loading || Boolean(success)}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Updating password...
                      </>
                    ) : (
                      <>
                        Update password
                        <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            <div className="auth-switch">
              <Link to="/login">Back to sign in</Link>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

export default ResetPassword;
