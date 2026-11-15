
import { useState } from 'react';

function TaskModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const newTask = {
      id: Date.now(),
      title,
      description,
      priority,
      dueDate,
      completed: false,
    };

    onSave(newTask);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h4>Create New Task</h4>
            <p>Add a task to your workspace.</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Task title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Complete project proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="What needs to be done?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="col-6 mb-3">
              <label className="form-label">Due date</label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-success">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
