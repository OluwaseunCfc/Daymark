
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

function Settings() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ''
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Update profile information
  async function handleProfileUpdate(e) {
    e.preventDefault();

    if (!fullName.trim()) {
      setProfileError('Please enter your full name.');
      return;
    }

    setProfileLoading(true);
    setProfileMessage('');
    setProfileError('');

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
      },
    });

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileMessage('Your profile has been updated successfully.');
    }

    setProfileLoading(false);
  }

  // Change account password
  async function handlePasswordUpdate(e) {
    e.preventDefault();

    setPasswordMessage('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Your new password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Your new passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    // Verify the current password by signing in again
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError('Your current password is incorrect.');
      setPasswordLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMessage('Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setPasswordLoading(false);
  }

  return (
    <div className="dashboard-content">

      <div className="welcome-section">
        <div>
          <h2>Settings</h2>
          <p>Manage your account information and security.</p>
        </div>
      </div>

      <div className="settings-container">

        {/* Profile Settings */}
        <div className="dashboard-card settings-card">

          <div className="settings-card-header">
            <div className="settings-icon">
              <i className="bi bi-person-circle"></i>
            </div>

            <div>
              <h4>Profile Information</h4>
              <p>Update your personal account details.</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate}>

            <div className="settings-form-group">
              <label htmlFor="settings-name">Full Name</label>

              <input
                id="settings-name"
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="settings-email">Email Address</label>

              <input
                id="settings-email"
                type="email"
                className="form-control"
                value={user?.email || ''}
                readOnly
              />

              <small>
                Your registered email address cannot be changed here.
              </small>
            </div>

            {profileError && (
              <div className="alert alert-danger py-2">
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div className="alert alert-success py-2">
                {profileMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-success settings-save-btn"
              disabled={profileLoading}
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>

          </form>
        </div>

        {/* Password Settings */}
        <div className="dashboard-card settings-card">

          <div className="settings-card-header">
            <div className="settings-icon password-settings-icon">
              <i className="bi bi-shield-lock"></i>
            </div>

            <div>
              <h4>Change Password</h4>
              <p>Keep your account secure with a strong password.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate}>

            <div className="settings-form-group">
              <label htmlFor="current-password">Current Password</label>

              <input
                id="current-password"
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="new-password">New Password</label>

              <input
                id="new-password"
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                autoComplete="new-password"
                required
              />

              <small>Use at least 6 characters.</small>
            </div>

            <div className="settings-form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>

              <input
                id="confirm-password"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                required
              />
            </div>

            {passwordError && (
              <div className="alert alert-danger py-2">
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="alert alert-success py-2">
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-success settings-save-btn"
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}

export default Settings;
