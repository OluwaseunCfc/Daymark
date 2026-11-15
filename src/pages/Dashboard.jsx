import { useState } from "react";
import StatCard from "../components/StatCard";
import TaskModal from "../components/TaskModal";

function Dashboard() {
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete React project",
      description: "Finish the dashboard interface",
      priority: "High",
      dueDate: "2026-11-16",
      completed: false,
    },
    {
      id: 2,
      title: "Review JavaScript concepts",
      description: "Revise functions and array methods",
      priority: "Medium",
      dueDate: "2026-11-17",
      completed: false,
    },
    {
      id: 3,
      title: "Prepare project documentation",
      description: "Write documentation for the project",
      priority: "Low",
      dueDate: "2026-11-18",
      completed: true,
    },
  ]);

  function handleSaveTask(newTask) {
    setTasks((previousTasks) => [newTask, ...previousTasks]);
  }

  function toggleTask(taskId) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const today = new Date().toISOString().split("T")[0];

  const dueToday = tasks.filter(
    (task) => !task.completed && task.dueDate === today,
  ).length;

  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="dashboard-content">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h2>Good day, Oluwaseun!</h2>
          <p>Here's what's happening with your productivity today.</p>
        </div>

        <button
          className="btn btn-success"
          onClick={() => setShowTaskModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          New Task
        </button>
      </div>

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
                style={{ "--progress": `${progress}%` }}
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
              {recentTasks.length > 0 ? (
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
                      <h6 className={task.completed ? "task-completed" : ""}>
                        {task.title}
                      </h6>

                      <p>{task.description || "No description provided"}</p>
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
                              `${task.dueDate}T00:00:00`,
                            ).toLocaleDateString()
                          : "No due date"}
                      </small>
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
              <button onClick={() => setShowTaskModal(true)}>
                <span className="quick-action-icon green-action">
                  <i className="bi bi-plus-lg"></i>
                </span>
                <span>Create New Task</span>
                <i className="bi bi-chevron-right"></i>
              </button>

              <button>
                <span className="quick-action-icon blue-action">
                  <i className="bi bi-calendar3"></i>
                </span>
                <span>View Calendar</span>
                <i className="bi bi-chevron-right"></i>
              </button>

              <button>
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
              {tasks
                .filter(
                  (task) =>
                    !task.completed && task.dueDate && task.dueDate >= today,
                )
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 3)
                .map((task) => (
                  <div className="deadline-item" key={task.id}>
                    <span className="deadline-icon">
                      <i className="bi bi-calendar2-event"></i>
                    </span>

                    <div>
                      <h6>{task.title}</h6>
                      <small>
                        {new Date(
                          `${task.dueDate}T00:00:00`,
                        ).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))}

              {tasks.filter(
                (task) =>
                  !task.completed && task.dueDate && task.dueDate >= today,
              ).length === 0 && (
                <p className="text-muted small mb-0">No upcoming deadlines.</p>
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

      {/* Task Creation Modal */}
      {showTaskModal && (
        <TaskModal
          onClose={() => setShowTaskModal(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

export default Dashboard;
