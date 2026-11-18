
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

function Profile() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user's tasks
  useEffect(() => {
    if (!user) return;

    async function fetchTasks() {
      setLoading(true);

      const { data, error } = await supabase
        .from('tasks')
        .select('id, completed')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching profile statistics:', error.message);
      } else {
        setTasks(data || []);
      }

      setLoading(false);
    }

    fetchTasks();
  }, [user]);

  const fullName = user?.user_metadata?.full_name || 'Daymark User';
  const email = user?.email || '';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('');

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const accountCreated = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not available';

  return (
    <div className="dashboard-content">

      {/* Page Heading */}
      <div className="welcome-section">
        <div>
          <h2>My Profile</h2>
          <p>View your account information and productivity overview.</p>
        </div>
      </div>

      {/* Profile Header */}
      <div className="dashboard-card profile-header-card">

        <div className="profile-avatar">
          {initials || 'DU'}
        </div>

        <div className="profile-header-info">
          <h3>{fullName}</h3>
          <p>{email}</p>

          <span className="profile-member-badge">
            <i className="bi bi-patch-check-fill"></i>
            Daymark Founder
          </span>
        </div>

        <div className="profile-header-action">
          <a href="/settings" className="btn btn-outline-success">
            <i className="bi bi-pencil-square"></i>
            Edit Profile
          </a>
        </div>

      </div>

      {/* Productivity Statistics */}
      <div className="profile-section-heading">
        <h4>Productivity Overview</h4>
        <p>A summary of your activity on Daymark.</p>
      </div>

      <div className="stats-grid">

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Total Tasks</p>
            <h3>{loading ? '...' : totalTasks}</h3>
          </div>
          <div className="stat-icon">
            <i className="bi bi-list-task"></i>
          </div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Completed</p>
            <h3>{loading ? '...' : completedTasks}</h3>
          </div>
          <div className="stat-icon completed-icon">
            <i className="bi bi-check-circle"></i>
          </div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Pending</p>
            <h3>{loading ? '...' : pendingTasks}</h3>
          </div>
          <div className="stat-icon">
            <i className="bi bi-clock-history"></i>
          </div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Completion Rate</p>
            <h3>{loading ? '...' : `${completionRate}%`}</h3>
          </div>
          <div className="stat-icon completed-icon">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
        </div>

      </div>

      {/* Account Information */}
      <div className="profile-section-heading">
        <h4>Account Information</h4>
        <p>Your registered account details.</p>
      </div>

      <div className="dashboard-card profile-details-card">

        <div className="profile-detail-row">
          <div className="profile-detail-icon">
            <i className="bi bi-person"></i>
          </div>

          <div className="profile-detail-content">
            <span>Full Name</span>
            <strong>{fullName}</strong>
          </div>
        </div>

        <div className="profile-detail-row">
          <div className="profile-detail-icon">
            <i className="bi bi-envelope"></i>
          </div>

          <div className="profile-detail-content">
            <span>Email Address</span>
            <strong>{email}</strong>
          </div>
        </div>

        <div className="profile-detail-row">
          <div className="profile-detail-icon">
            <i className="bi bi-calendar-check"></i>
          </div>

          <div className="profile-detail-content">
            <span>Member Since</span>
            <strong>{accountCreated}</strong>
          </div>
        </div>

        <div className="profile-detail-row">
          <div className="profile-detail-icon">
            <i className="bi bi-shield-check"></i>
          </div>

          <div className="profile-detail-content">
            <span>Account Status</span>
            <strong className="profile-active-status">
              Active
            </strong>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Profile;
