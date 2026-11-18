
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(
        'If an account exists with this email, a password recovery link will be sent. Please check your inbox.'
      );
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
          <Link to="/login" className="auth-brand">
            <span className="auth-brand-icon">
              <i className="bi bi-check2"></i>
            </span>
            <span>daymark</span>
          </Link>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">ACCOUNT RECOVERY</span>

            <h1>A fresh start is just a step away.</h1>

            <p>
              Forgot your password? No worries.
              We'll help you get back to your workspace
              and continue making progress.
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
              <span className="auth-form-eyebrow">PASSWORD RECOVERY</span>
              <h2>Forgot your password?</h2>
              <p>
                Enter the email address associated with
                your account. We'll send you a recovery link.
              </p>
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

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="recovery-email">Email address</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-envelope"></i>
                  <input
                    id="recovery-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
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
                    Sending link...
                  </>
                ) : (
                  <>
                    Send recovery link
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              Remembered your password?
              <Link to="/login">Back to sign in</Link>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
