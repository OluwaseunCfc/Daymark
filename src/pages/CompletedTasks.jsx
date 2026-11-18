
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import TaskModal from '../components/TaskModal';

function CompletedTasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // Fetch completed tasks belonging to the logged-in user
  useEffect(() => {
    if (!user) return;

    async function fetchCompletedTasks() {
      setLoading(true);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed tasks:', error.message);
      } else {
        setTasks(
          (data || []).map((task) => ({
            ...task,
            dueDate: task.due_date,
          }))
        );
      }

      setLoading(false);
    }

    fetchCompletedTasks();
  }, [user]);

  // Search completed tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const search = searchTerm.toLowerCase();

      return (
        task.title.toLowerCase().includes(search) ||
        (task.description || '').toLowerCase().includes(search)
      );
    });
  }, [tasks, searchTerm]);

  // Mark task as pending again
  async function handleRestoreTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: false })
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error restoring task:', error.message);
      alert('Unable to restore task. Please try again.');
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  // Edit task
  async function handleSaveTask(taskData, taskId) {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.dueDate || null,
      })
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating task:', error.message);
      return false;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...taskData }
          : task
      )
    );

    setEditingTask(null);
    return true;
  }

  // Delete task
  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this task?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error.message);
      alert('Unable to delete task. Please try again.');
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  return (
    <div className="dashboard-content">

      <div className="welcome-section">
        <div>
          <h2>Completed Tasks</h2>
          <p>Review and manage the tasks you've completed.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Completed Tasks</p>
            <h3>{tasks.length}</h3>
          </div>
          <div className="stat-icon completed-icon">
            <i className="bi bi-check-circle"></i>
          </div>
        </div>
      </div>

      <div className="dashboard-card">

        <div className="card-header-custom">
          <div>
            <h4>Completed List</h4>
            <p>Your finished tasks</p>
          </div>

          <div className="task-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search completed tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="recent-tasks-list">
            {filteredTasks.map((task) => (
              <div className="task-row" key={task.id}>

                <div className="task-check completed-check">
                  <i className="bi bi-check-lg"></i>
                </div>

                <div className="task-details">
                  <h6>{task.title}</h6>

                  {task.description && (
                    <p>{task.description}</p>
                  )}

                  <div className="task-meta">
                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>

                    {task.dueDate && (
                      <span className="task-date">
                        <i className="bi bi-calendar3"></i>
                        {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="task-actions">
                    <button
                      className="btn btn-sm btn-outline-success"
                      title="Mark as pending"
                      onClick={() => handleRestoreTask(task.id)}
                    >
                      <i className="bi bi-arrow-counterclockwise"></i>
                      <span className="ms-1">Restore</span>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-primary"
                      title="Edit task"
                      onClick={() => setEditingTask(task)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Delete task"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="empty-tasks">
            <i className="bi bi-clipboard-check"></i>
            <h5>
              {searchTerm
                ? 'No matching tasks found'
                : 'No completed tasks yet'}
            </h5>
            <p>
              {searchTerm
                ? 'Try searching with another keyword.'
                : 'Tasks you mark as completed will appear here.'}
            </p>
          </div>
        )}

      </div>

      {editingTask && (
        <TaskModal
          initialTask={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
        />
      )}

    </div>
  );
}

export default CompletedTasks;
