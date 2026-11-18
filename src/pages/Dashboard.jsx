
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import TaskModal from '../components/TaskModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Convert database fields into our React task format.
  function formatTask(task) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.due_date,
      completed: task.completed,
    };
  }

  // Fetch tasks belonging to the logged-in user.
  useEffect(() => {
    async function fetchTasks() {
      if (!user?.id) return;

      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error.message);
        setErrorMessage('Unable to load your tasks. Please refresh the page.');
      } else {
        setTasks(data.map(formatTask));
      }

      setLoading(false);
    }

    fetchTasks();
  }, [user?.id]);

  // Open the modal for creating a new task.
  function openCreateModal() {
    setEditingTask(null);
    setShowTaskModal(true);
  }

  // Open the modal with an existing task.
  function openEditModal(task) {
    setEditingTask(task);
    setShowTaskModal(true);
  }

  // Create a new task or update an existing one.
  async function handleSaveTask(taskData, taskId = null) {
    if (!user?.id) {
      setErrorMessage('You must be logged in to manage tasks.');
      return false;
    }

    setErrorMessage('');

    const databaseTask = {
      title: taskData.title.trim(),
      description: taskData.description.trim() || null,
      priority: taskData.priority,
      due_date: taskData.dueDate || null,
    };

    // EDIT EXISTING TASK
    if (taskId) {
      const { data, error } = await supabase
        .from('tasks')
        .update(databaseTask)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error.message);
        setErrorMessage(`Unable to update task: ${error.message}`);
        return false;
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId ? formatTask(data) : task
        )
      );

      return true;
    }

    // CREATE NEW TASK
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...databaseTask,
        completed: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error.message);
      setErrorMessage(`Unable to create task: ${error.message}`);
      return false;
    }

    setTasks((previousTasks) => [
      formatTask(data),
      ...previousTasks,
    ]);

    return true;
  }

  // Delete a task from Supabase.
  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task? This action cannot be undone.'
    );

    if (!confirmed) return;

    setErrorMessage('');
    setDeletingTaskId(taskId);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error.message);
      setErrorMessage('Unable to delete this task. Please try again.');
    } else {
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== taskId)
      );
    }

    setDeletingTaskId(null);
  }

  // Update task completion status.
  async function toggleTask(taskId) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task || !user?.id) return;

    setErrorMessage('');

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error.message);
      setErrorMessage('Unable to update this task. Please try again.');
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.map((item) =>
        item.id === taskId ? formatTask(data) : item
      )
    );
  }

  // Dashboard statistics.
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Get today's date in the user's local timezone.
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const dueToday = tasks.filter(
    (task) => !task.completed && task.dueDate === today
  ).length;

  const progress =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const recentTasks = tasks.slice(0, 5);

  const upcomingTasks = tasks
    .filter(
      (task) =>
        !task.completed &&
        task.dueDate &&
        task.dueDate >= today
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  const fullName = user?.user_metadata?.full_name;
  const firstName = fullName
    ? fullName.split(' ')[0]
    : user?.email?.split('@')[0] || 'there';

  return (
    <div className="dashboard-content">

      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h2>Good day, {firstName}!</h2>
          <p>Here's what's happening with your productivity today.</p>
        </div>

        <button
          className="btn btn-success"
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-lg me-2"></i>
          New Task
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Statistics */}
      <div className="stats-grid">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon="bi-list-task"
          color="blue"
        />

        <StatCard
          title="Completed"
          value={completedTasks}
          icon="bi-check-circle"
          color="green"
        />

        <StatCard
          title="Pending"
          value={pendingTasks}
          icon="bi-hourglass-split"
          color="orange"
        />

        <StatCard
          title="Due Today"
          value={dueToday}
          icon="bi-calendar-event"
          color="purple"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">

        {/* Left Column */}
        <div className="dashboard-left">

          {/* Productivity Card */}
          <div className="dashboard-card productivity-card">
            <div className="card-heading">
              <div>
                <h5>Productivity Overview</h5>
                <p>Your task completion progress</p>
              </div>

              <i className="bi bi-three-dots"></i>
            </div>

            <div className="productivity-content">
              <div
                className="progress-circle"
                style={{ '--progress': `${progress}%` }}
              >
                <div className="progress-circle-inner">
                  <h3>{progress}%</h3>
                  <span>Completed</span>
                </div>
              </div>

              <div className="productivity-details">
                <div>
                  <span className="legend-dot completed-dot"></span>
                  <span>Completed</span>
                  <strong>{completedTasks}</strong>
                </div>

                <div>
                  <span className="legend-dot pending-dot"></span>
                  <span>Pending</span>
                  <strong>{pendingTasks}</strong>
                </div>

                <p>
                  Keep going! Every completed task brings you closer to your
                  goals.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="dashboard-card recent-tasks-card">
            <div className="card-heading">
              <div>
                <h5>Recent Tasks</h5>
                <p>Keep track of your latest activities</p>
              </div>

              <button className="view-all-btn">
                View all <i className="bi bi-arrow-right"></i>
              </button>
            </div>

            <div className="recent-tasks-list">
              {loading ? (
                <p className="text-muted">Loading your tasks...</p>
              ) : recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div className="task-row" key={task.id}>
                    <div className="task-check">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />
                    </div>

                    <div className="task-details">
                      <h6 className={task.completed ? 'task-completed' : ''}>
                        {task.title}
                      </h6>

                      <p>
                        {task.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="task-meta">
                      <span
                        className={`priority-badge ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>

                      <small>
                        {task.dueDate
                          ? new Date(
                              `${task.dueDate}T00:00:00`
                            ).toLocaleDateString()
                          : 'No due date'}
                      </small>

                      {/* Edit and Delete Actions */}
                      <div className="task-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          title="Edit task"
                          onClick={() => openEditModal(task)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Delete task"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deletingTaskId === task.id}
                        >
                          <i
                            className={
                              deletingTaskId === task.id
                                ? 'bi bi-hourglass-split'
                                : 'bi bi-trash'
                            }
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-tasks">
                  <i className="bi bi-clipboard-check"></i>
                  <p>No tasks yet. Create your first task!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">

          {/* Quick Actions */}
          <div className="dashboard-card quick-actions-card">
            <div className="card-heading">
              <div>
                <h5>Quick Actions</h5>
                <p>Get things done faster</p>
              </div>
            </div>

            <div className="quick-actions-list">
              <button onClick={openCreateModal}>
                <span className="quick-action-icon green-action">
                  <i className="bi bi-plus-lg"></i>
                </span>
                <span>Create New Task</span>
                <i className="bi bi-chevron-right"></i>
              </button>

              <button onClick={() => navigate('/calendar')}>
                <span className="quick-action-icon blue-action">
                  <i className="bi bi-calendar3"></i>
                </span>
                <span>View Calendar</span>
                <i className="bi bi-chevron-right"></i>
              </button>

              <button onClick={() => navigate('/reports')}>
                <span className="quick-action-icon orange-action">
                  <i className="bi bi-bar-chart"></i>
                </span>
                <span>View Reports</span>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="dashboard-card deadlines-card">
            <div className="card-heading">
              <div>
                <h5>Upcoming Deadlines</h5>
                <p>Tasks that need your attention</p>
              </div>
            </div>

            <div className="deadline-list">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div className="deadline-item" key={task.id}>
                    <span className="deadline-icon">
                      <i className="bi bi-calendar2-event"></i>
                    </span>

                    <div>
                      <h6>{task.title}</h6>
                      <small>
                        {new Date(
                          `${task.dueDate}T00:00:00`
                        ).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted small mb-0">
                  No upcoming deadlines.
                </p>
              )}
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="quote-card">
            <i className="bi bi-quote"></i>
            <p>
              Great things are done by a series of small things brought
              together.
            </p>
            <span>— Vincent van Gogh</span>
          </div>
        </div>
      </div>

      {/* Task Creation and Editing Modal */}
      {showTaskModal && (
        <TaskModal
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          initialTask={editingTask}
        />
      )}
    </div>
  );
}

export default Dashboard;
