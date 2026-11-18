
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

function Calendar() {
  const { user } = useAuth();

  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split('T')[0]
  );

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch user's tasks from Supabase
  useEffect(() => {
    if (!user) return;

    async function fetchTasks() {
      setLoading(true);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching calendar tasks:', error.message);
      } else {
        setTasks(data || []);
      }

      setLoading(false);
    }

    fetchTasks();
  }, [user]);

  // Navigate between months
  function changeMonth(direction) {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1
      )
    );
  }

  // Format date as YYYY-MM-DD without timezone conversion
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Build calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty spaces before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  // Tasks scheduled for selected date
  const selectedTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.due_date === selectedDate
    );
  }, [tasks, selectedDate]);

  // Get number of tasks for a particular date
  function getTasksForDate(date) {
    if (!date) return [];

    const dateString = formatDate(date);

    return tasks.filter(
      (task) => task.due_date === dateString
    );
  }

  // Toggle task completion
  async function toggleTask(task) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Unable to update task:', error.message);
      alert('Unable to update task. Please try again.');
      return;
    }

    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  }

  const totalMonthTasks = tasks.filter((task) => {
    const taskDate = new Date(`${task.due_date}T00:00:00`);

    return (
      taskDate.getMonth() === currentDate.getMonth() &&
      taskDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const completedMonthTasks = tasks.filter((task) => {
    const taskDate = new Date(`${task.due_date}T00:00:00`);

    return (
      taskDate.getMonth() === currentDate.getMonth() &&
      taskDate.getFullYear() === currentDate.getFullYear() &&
      task.completed
    );
  }).length;

  return (
    <div className="dashboard-content">

      {/* Page Heading */}
      <div className="welcome-section">
        <div>
          <h2>Calendar</h2>
          <p>Keep track of your tasks and important deadlines.</p>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="stats-grid">

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Scheduled Tasks</p>
            <h3>{totalMonthTasks}</h3>
          </div>
          <div className="stat-icon">
            <i className="bi bi-calendar-event"></i>
          </div>
        </div>

        <div className="dashboard-card stat-card">
          <div className="stat-info">
            <p>Completed</p>
            <h3>{completedMonthTasks}</h3>
          </div>
          <div className="stat-icon completed-icon">
            <i className="bi bi-check-circle"></i>
          </div>
        </div>

      </div>

      {/* Calendar Layout */}
      <div className="calendar-layout">

        <div className="dashboard-card calendar-card">

          {/* Calendar Header */}
          <div className="calendar-header">
            <div>
              <h4>
                {monthNames[currentDate.getMonth()]}{' '}
                {currentDate.getFullYear()}
              </h4>
              <p>Monthly overview</p>
            </div>

            <div className="calendar-navigation">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentDate(
                    new Date(today.getFullYear(), today.getMonth(), 1)
                  )
                }
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="calendar-grid calendar-weekdays">
            {weekdays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Dates */}
          <div className="calendar-grid calendar-dates">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="calendar-empty"></div>;
              }

              const dateString = formatDate(date);
              const dayTasks = getTasksForDate(date);

              const isToday = dateString === formatDate(today);
              const isSelected = dateString === selectedDate;

              return (
                <button
                  type="button"
                  key={dateString}
                  className={`calendar-day
                    ${isToday ? 'today' : ''}
                    ${isSelected ? 'selected' : ''}
                    ${dayTasks.length ? 'has-tasks' : ''}`}
                  onClick={() => setSelectedDate(dateString)}
                >
                  <span className="calendar-day-number">
                    {date.getDate()}
                  </span>

                  {dayTasks.length > 0 && (
                    <div className="calendar-task-indicators">
                      {dayTasks.slice(0, 3).map((task) => (
                        <span
                          key={task.id}
                          className={`calendar-task-dot ${
                            task.completed ? 'completed' : task.priority.toLowerCase()
                          }`}
                        ></span>
                      ))}

                      {dayTasks.length > 3 && (
                        <small>+{dayTasks.length - 3}</small>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="calendar-legend">
            <span>
              <i className="legend-dot high"></i>
              High priority
            </span>
            <span>
              <i className="legend-dot medium"></i>
              Medium priority
            </span>
            <span>
              <i className="legend-dot low"></i>
              Low priority
            </span>
            <span>
              <i className="legend-dot completed"></i>
              Completed
            </span>
          </div>

        </div>

        {/* Selected Date Tasks */}
        <div className="dashboard-card calendar-task-panel">

          <div className="calendar-panel-header">
            <div>
              <h4>Tasks for this day</h4>
              <p>
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }
                )}
              </p>
            </div>

            <span className="calendar-task-count">
              {selectedTasks.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : selectedTasks.length > 0 ? (
            <div className="calendar-task-list">

              {selectedTasks.map((task) => (
                <div className="calendar-task-item" key={task.id}>

                  <button
                    type="button"
                    className={`calendar-task-check ${
                      task.completed ? 'checked' : ''
                    }`}
                    onClick={() => toggleTask(task)}
                    aria-label={
                      task.completed
                        ? 'Mark as pending'
                        : 'Mark as completed'
                    }
                  >
                    {task.completed && (
                      <i className="bi bi-check-lg"></i>
                    )}
                  </button>

                  <div className="calendar-task-info">
                    <h6 className={task.completed ? 'task-finished' : ''}>
                      {task.title}
                    </h6>

                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          ) : (
            <div className="empty-tasks calendar-empty-state">
              <i className="bi bi-calendar2-check"></i>
              <h5>No tasks scheduled</h5>
              <p>There are no tasks with a due date on this day.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Calendar;
