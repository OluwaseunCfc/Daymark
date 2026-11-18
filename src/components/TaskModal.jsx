
import { useState } from 'react';

function TaskModal({ onClose, onSave, initialTask = null }) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(
    initialTask?.description || ''
  );
  const [priority, setPriority] = useState(
    initialTask?.priority || 'Medium'
  );
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate || ''
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = Boolean(initialTask);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
    };

    const success = await onSave(
      taskData,
      initialTask?.id || null
    );

    if (success) {
      onClose();
    } else {
      setErrorMessage('Unable to save task. Please try again.');
    }

    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={saving ? undefined : onClose}>
      <div
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h4>{isEditing ? 'Edit Task' : 'Create New Task'}</h4>
            <p>
              {isEditing
                ? 'Update your task details.'
                : 'Add a task to your workspace.'}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
            />
          </div>

          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={saving}
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
                disabled={saving}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2">
              {errorMessage}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-success"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
