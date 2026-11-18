
import { useEffect, useMemo, useState } from 'react';
import TaskModal from '../components/TaskModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

function MyTasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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

  // Fetch user's tasks.
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
        console.error(error.message);
        setErrorMessage('Unable to load your tasks.');
      } else {
        setTasks(data.map(formatTask));
      }

      setLoading(false);
    }

    fetchTasks();
  }, [user?.id]);

  // Create or edit a task.
  async function handleSaveTask(taskData, taskId = null) {
    const databaseTask = {
      title: taskData.title.trim(),
      description: taskData.description.trim() || null,
      priority: taskData.priority,
      due_date: taskData.dueDate || null,
    };

    if (taskId) {
      const { data, error } = await supabase
        .from('tasks')
        .update(databaseTask)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error(error.message);
        setErrorMessage('Unable to update task.');
        return false;
      }

      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId ? formatTask(data) : task
        )
      );

      return true;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...databaseTask,
        user_id: user.id,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error(error.message);
      setErrorMessage('Unable to create task.');
      return false;
    }

    setTasks((previous) => [formatTask(data), ...previous]);
    return true;
  }

  // Toggle task completion.
  async function toggleTask(task) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error(error.message);
      setErrorMessage('Unable to update task status.');
      return;
    }

    setTasks((previous) =>
      previous.map((item) =>
        item.id === task.id ? formatTask(data) : item
      )
    );
  }

  // Delete task.
  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error(error.message);
      setErrorMessage('Unable to delete task.');
      return;
    }

    setTasks((previous) =>
      previous.filter((task) => task.id !== taskId)
    );
  }

  // Filter and search tasks.
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Pending' && !task.completed) ||
        (activeFilter === 'Completed' && task.completed);

      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description || '')
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, search]);

  const pendingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="dashboard-content">

      {/* Page Heading */}
      <div className="welcome-section">
        <div>
          <h2>My Tasks</h2>
          <p>Organise, track and manage all your tasks.</p>
        </div>

        <button
          className="btn btn-success"
          onClick={() => {
            setEditingTask(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          New Task
        </button>
      </div>

      {/* Task Statistics */}
      <div className="stats-grid">
        <div className="dashboard-card">
          <h6 className="text-muted">Total Tasks</h6>
          <h3>{tasks.length}</h3>
        </div>

        <div className="dashboard-card">
          <h6 className="text-muted">Pending</h6>
          <h3>{pendingCount}</h3>
        </div>

        <div className="dashboard-card">
          <h6 className="text-muted">Completed</h6>
          <h3>{completedCount}</h3>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
          <button
            className="btn-close float-end"
            onClick={() => setErrorMessage('')}
          ></button>
        </div>
      )}

      {/* Task Management */}
      <div className="dashboard-card mt-4">

        {/* Search */}
        <div className="mb-4">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>

            <input
              type="search"
              className="form-control"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {['All', 'Pending', 'Completed'].map((filter) => (
            <button
              key={filter}
              className={`btn ${
                activeFilter === filter
                  ? 'btn-success'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              {' '}
              <span>
                {filter === 'All'
                  ? tasks.length
                  : filter === 'Pending'
                    ? pendingCount
                    : completedCount}
              </span>
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success"></div>
            <p className="mt-3 text-muted">Loading tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="recent-tasks-list">
            {filteredTasks.map((task) => (
              <div className="task-row" key={task.id}>

                <div className="task-check">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
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

                  <div className="task-actions">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      title="Edit task"
                      onClick={() => {
                        setEditingTask(task);
                        setShowModal(true);
                      }}
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
          <div className="empty-tasks text-center py-5">
            <i className="bi bi-clipboard-check"></i>
            <p>
              {search
                ? 'No tasks match your search.'
                : `No ${activeFilter.toLowerCase()} tasks found.`}
            </p>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          initialTask={editingTask}
        />
      )}
    </div>
  );
}

export default MyTasks;
