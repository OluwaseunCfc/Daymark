
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

// Get today's date using the user's local timezone
function getLocalDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Calculate the difference between two date strings
function getDaysDifference(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = getLocalDate()
    .split('-')
    .map(Number);

  const dueDate = Date.UTC(year, month - 1, day);
  const todayDate = Date.UTC(todayYear, todayMonth - 1, todayDay);

  return Math.round((dueDate - todayDate) / 86400000);
}

function formatDueDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
  });
}

function Topbar({ onMenuClick }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationError, setNotificationError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const fullName = user?.user_metadata?.full_name || 'Daymark User';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/tasks': 'My Tasks',
    '/completed': 'Completed Tasks',
    '/calendar': 'Calendar',
    '/reports': 'Reports',
    '/settings': 'Settings',
    '/profile': 'My Profile',
  };

  const pageTitle = pageTitles[location.pathname] || 'Daymark';

  // Fetch notifications from Supabase
  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      if (!user?.id) {
        setNotifications([]);
        setNotificationLoading(false);
        return;
      }

      setNotificationLoading(true);
      setNotificationError('');

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, due_date, completed')
        .eq('user_id', user.id)
        .eq('completed', false)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error('Notification error:', error.message);
        setNotificationError('Unable to load notifications.');
        setNotifications([]);
      } else {
        const reminders = (data || [])
          .map((task) => {
            const daysDifference = getDaysDifference(task.due_date);

            let type = '';
            let message = '';

            if (daysDifference < 0) {
              type = 'overdue';
              message = `${Math.abs(daysDifference)} day(s) overdue`;
            } else if (daysDifference === 0) {
              type = 'today';
              message = 'Due today';
            } else if (daysDifference <= 3) {
              type = 'upcoming';
              message = daysDifference === 1
                ? 'Due tomorrow'
                : `Due in ${daysDifference} days`;
            }

            return {
              ...task,
              type,
              message,
            };
          })
          .filter((task) => task.type !== '');

        setNotifications(reminders);
      }

      setNotificationLoading(false);
    }

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, [user?.id, location.pathname]);

  // Search the user's tasks in Supabase
  useEffect(() => {
    const query = searchTerm.trim();

    if (!query || !user?.id) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearching(true);

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, completed')
        .eq('user_id', user.id)
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(8);

      if (cancelled) return;

      if (error) {
        console.error('Task search error:', error.message);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }

      setSearching(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, user?.id]);

  function handleSearchChange(event) {
    const value = event.target.value;
    setSearchTerm(value);
    if (!value.trim() || !user?.id) {
      setSearchResults([]);
      setSearching(false);
    }
    setShowSearchResults(true);
    setShowNotifications(false);
    setShowProfile(false);
  }

  function handleResultClick(task) {
    setShowSearchResults(false);
    setSearchTerm('');

    navigate(task.completed ? '/completed' : '/tasks');
  }

  function handleNotificationClick() {
    setShowNotifications(false);
    navigate('/tasks');
  }

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    setLoggingOut(false);

    if (error) {
      console.error('Logout error:', error.message);
      return;
    }

    setShowProfile(false);
    navigate('/login', { replace: true });
  }

  return (
    <header className="topbar">

      <button
        type="button"
        className="hamburger-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <i className="bi bi-list"></i>
      </button>

      <div className="topbar-page-title">
        <h4>{pageTitle}</h4>
      </div>

      {/* Search */}
      <div className="search-box">
        <i className="bi bi-search"></i>

        <input
          type="text"
          placeholder="Search your tasks..."
          aria-label="Search your tasks"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowSearchResults(true)}
        />

        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
              setShowSearchResults(false);
            }}
            aria-label="Clear search"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}

        {!searchTerm && (
          <span className="search-shortcut">Ctrl + K</span>
        )}

        {user?.id && showSearchResults && searchTerm.trim() && (
          <div className="search-results-dropdown">
            <div className="search-results-heading">
              <span>Search Results</span>
            </div>

            {searching ? (
              <div className="search-message">
                <span className="spinner-border spinner-border-sm text-success"></span>
                Searching tasks...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((task) => (
                <button
                  type="button"
                  className="search-result-item"
                  key={task.id}
                  onClick={() => handleResultClick(task)}
                >
                  <div className="search-result-icon">
                    <i className={
                      task.completed
                        ? 'bi bi-check-circle'
                        : 'bi bi-list-check'
                    }></i>
                  </div>

                  <div className="search-result-info">
                    <strong>{task.title}</strong>
                    <span>
                      {task.completed ? 'Completed task' : 'Pending task'}
                    </span>
                  </div>

                  <i className="bi bi-arrow-up-left search-result-arrow"></i>
                </button>
              ))
            ) : (
              <div className="search-message">
                <i className="bi bi-search"></i>
                <span>No matching tasks found.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {user?.id && showSearchResults && searchTerm.trim() && (
        <div
          className="search-backdrop"
          onClick={() => setShowSearchResults(false)}
        ></div>
      )}

      <div className="topbar-actions">

        {/* Notifications */}
        <div className="notification-wrapper">

          <button
            className="notification-btn"
            type="button"
            onClick={() => {
              setShowNotifications((previous) => !previous);
              setShowProfile(false);
              setShowSearchResults(false);
            }}
            aria-label={`Notifications: ${notifications.length} reminders`}
            aria-expanded={showNotifications}
          >
            <i className="bi bi-bell"></i>

            {notifications.length > 0 && (
              <span className="notification-dot">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="notification-backdrop"
                onClick={() => setShowNotifications(false)}
              ></div>

              <div className="notification-dropdown">

                <div className="notification-header">
                  <div>
                    <h6>Notifications</h6>
                    <span>
                      {notifications.length} active reminder(s)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="notification-list">

                  {notificationLoading ? (
                    <div className="notification-empty">
                      <span className="spinner-border spinner-border-sm text-success"></span>
                      Loading notifications...
                    </div>
                  ) : notificationError ? (
                    <div className="notification-empty">
                      <i className="bi bi-exclamation-circle"></i>
                      {notificationError}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                      <i className="bi bi-check-circle"></i>
                      <strong>You're all caught up!</strong>
                      <span>No upcoming or overdue tasks.</span>
                    </div>
                  ) : (
                    notifications.map((task) => (
                      <button
                        type="button"
                        key={task.id}
                        className={`notification-item notification-${task.type}`}
                        onClick={handleNotificationClick}
                      >
                        <div className="notification-item-icon">
                          <i className={
                            task.type === 'overdue'
                              ? 'bi bi-exclamation-circle'
                              : task.type === 'today'
                                ? 'bi bi-calendar-event'
                                : 'bi bi-calendar-check'
                          }></i>
                        </div>

                        <div className="notification-item-info">
                          <strong>{task.title}</strong>
                          <span>{task.message}</span>
                          <small>
                            Due {formatDueDate(task.due_date)}
                          </small>
                        </div>

                        <i className="bi bi-chevron-right notification-chevron"></i>
                      </button>
                    ))
                  )}

                </div>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="notification-footer"
                    onClick={handleNotificationClick}
                  >
                    View My Tasks
                    <i className="bi bi-arrow-right"></i>
                  </button>
                )}

              </div>
            </>
          )}

        </div>

        {/* Profile */}
        <div className="profile-wrapper">

          <button
            type="button"
            className="profile-trigger"
            onClick={() => {
              setShowProfile((previous) => !previous);
              setShowNotifications(false);
              setShowSearchResults(false);
            }}
            aria-expanded={showProfile}
            aria-label="Open profile menu"
          >
            <div className="topbar-avatar">{initials}</div>
            <i className="bi bi-chevron-down profile-arrow"></i>
          </button>

          {showProfile && (
            <>
              <div
                className="profile-backdrop"
                onClick={() => setShowProfile(false)}
              ></div>

              <div className="profile-dropdown">

                <div className="profile-dropdown-info">
                  <strong>{fullName}</strong>
                  <span>{user?.email}</span>
                </div>

                <div className="profile-dropdown-divider"></div>

                <Link
                  to="/profile"
                  className="profile-dropdown-link"
                  onClick={() => setShowProfile(false)}
                >
                  <i className="bi bi-person"></i>
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  className="profile-dropdown-link"
                  onClick={() => setShowProfile(false)}
                >
                  <i className="bi bi-gear"></i>
                  Settings
                </Link>

                <div className="profile-dropdown-divider"></div>

                <button
                  type="button"
                  className="logout-option"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  {loggingOut ? 'Signing out...' : 'Sign Out'}
                </button>

              </div>
            </>
          )}

        </div>

      </div>

    </header>
  );
}

export default Topbar;
