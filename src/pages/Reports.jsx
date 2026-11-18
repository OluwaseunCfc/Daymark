
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

function Reports() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tasks belonging to the logged-in user
  useEffect(() => {
    if (!user) return;

    async function fetchTasks() {
      setLoading(true);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error.message);
      } else {
        setTasks(data || []);
      }

      setLoading(false);
    }

    fetchTasks();
  }, [user]);

  // Calculate report statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const highPriority = tasks.filter(
    (task) => task.priority === 'High'
  ).length;

  const mediumPriority = tasks.filter(
    (task) => task.priority === 'Medium'
  ).length;

  const lowPriority = tasks.filter(
    (task) => task.priority === 'Low'
  ).length;

  // Calculate monthly productivity for the last six months
  const monthlyData = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();

      const completed = tasks.filter((task) => {
        if (!task.completed) return false;

        const created = new Date(task.created_at);

        return (
          created.getMonth() === month &&
          created.getFullYear() === year
        );
      }).length;

      result.push({
        label: monthDate.toLocaleDateString('en-US', {
          month: 'short',
        }),
        completed,
      });
    }

    return result;
  }, [tasks]);

  const maxMonthlyValue = Math.max(
    ...monthlyData.map((item) => item.completed),
    1
  );

  // Recent tasks
  const recentTasks = tasks.slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-content text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Preparing your reports...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      {/* Heading */}
      <div className="welcome-section">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Track your productivity and understand your progress.</p>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="stats-grid">

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Total Tasks</p>
            <h3>{totalTasks}</h3>
          </div>
          <div className="stat-icon">
            <i className="bi bi-list-task"></i>
          </div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Completed</p>
            <h3>{completedTasks}</h3>
          </div>
          <div className="stat-icon completed-icon">
            <i className="bi bi-check-circle"></i>
          </div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Pending</p>
            <h3>{pendingTasks}</h3>
          </div>
          <div className="stat-icon">
            <i className="bi bi-clock-history"></i>
          </div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Completion Rate</p>
            <h3>{completionRate}%</h3>
          </div>
          <div className="stat-icon completed-icon">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
        </div>

      </div>

      {/* Analytics Sections */}
      <div className="reports-grid">

        {/* Completion Progress */}
        <div className="dashboard-card report-card">
          <div className="report-card-header">
            <div>
              <h4>Completion Progress</h4>
              <p>Your overall task completion rate</p>
            </div>
          </div>

          <div className="completion-progress-content">
            <div
              className="completion-circle"
              style={{
                '--progress': `${completionRate * 3.6}deg`,
              }}
            >
              <div className="completion-circle-inner">
                <h3>{completionRate}%</h3>
                <span>Completed</span>
              </div>
            </div>

            <div className="completion-summary">
              <div>
                <span className="report-dot completed-dot"></span>
                <span>Completed</span>
                <strong>{completedTasks}</strong>
              </div>

              <div>
                <span className="report-dot pending-dot"></span>
                <span>Pending</span>
                <strong>{pendingTasks}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="dashboard-card report-card">
          <div className="report-card-header">
            <div>
              <h4>Priority Breakdown</h4>
              <p>Tasks grouped by priority level</p>
            </div>
          </div>

          <div className="priority-report-list">

            <div className="priority-report-item">
              <div className="priority-report-label">
                <span className="report-dot high-dot"></span>
                <span>High Priority</span>
                <strong>{highPriority}</strong>
              </div>

              <div className="report-progress-track">
                <div
                  className="report-progress-fill high-fill"
                  style={{
                    width: `${totalTasks ? (highPriority / totalTasks) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="priority-report-item">
              <div className="priority-report-label">
                <span className="report-dot medium-dot"></span>
                <span>Medium Priority</span>
                <strong>{mediumPriority}</strong>
              </div>

              <div className="report-progress-track">
                <div
                  className="report-progress-fill medium-fill"
                  style={{
                    width: `${totalTasks ? (mediumPriority / totalTasks) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="priority-report-item">
              <div className="priority-report-label">
                <span className="report-dot low-dot"></span>
                <span>Low Priority</span>
                <strong>{lowPriority}</strong>
              </div>

              <div className="report-progress-track">
                <div
                  className="report-progress-fill low-fill"
                  style={{
                    width: `${totalTasks ? (lowPriority / totalTasks) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* Monthly Productivity */}
        <div className="dashboard-card report-card monthly-report-card">
          <div className="report-card-header">
            <div>
              <h4>Monthly Productivity</h4>
              <p>Completed tasks over the last six months</p>
            </div>
          </div>

          <div className="monthly-chart">
            {monthlyData.map((item) => (
              <div className="monthly-chart-column" key={item.label}>
                <div className="monthly-chart-value">
                  {item.completed}
                </div>

                <div className="monthly-chart-bar-area">
                  <div
                    className="monthly-chart-bar"
                    style={{
                      height: `${(item.completed / maxMonthlyValue) * 100}%`,
                    }}
                  ></div>
                </div>

                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card report-card recent-report-card">
          <div className="report-card-header">
            <div>
              <h4>Recent Activity</h4>
              <p>Your latest tasks</p>
            </div>
          </div>

          {recentTasks.length > 0 ? (
            <div className="recent-report-list">
              {recentTasks.map((task) => (
                <div className="recent-report-item" key={task.id}>
                  <div className={`activity-icon ${
                    task.completed ? 'activity-completed' : 'activity-pending'
                  }`}>
                    <i className={`bi ${
                      task.completed
                        ? 'bi-check-lg'
                        : 'bi-clock'
                    }`}></i>
                  </div>

                  <div className="activity-details">
                    <h6>{task.title}</h6>
                    <span>
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <span className={`activity-status ${
                    task.completed ? 'status-completed' : 'status-pending'
                  }`}>
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-tasks">
              <i className="bi bi-bar-chart"></i>
              <h5>No activity yet</h5>
              <p>Create your first task to start tracking productivity.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Reports;
