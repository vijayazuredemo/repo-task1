import { useEffect, useId, useRef, useState } from 'react'
import { priorityLabel } from '../priorities.js'

const EMPTY_TITLE_ERROR = 'Please enter a task title.'

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const editButtonRef = useRef(null)
  const restoreFocus = useRef(false)
  const errorId = useId()
  const priority = priorityLabel(task.priority)

  useEffect(() => {
    if (!isEditing && restoreFocus.current) {
      restoreFocus.current = false
      editButtonRef.current.focus()
    }
  }, [isEditing])

  function startEditing() {
    setDraft(task.title)
    setError('')
    setIsEditing(true)
  }

  function stopEditing() {
    restoreFocus.current = true
    setError('')
    setIsEditing(false)
  }

  function handleSave(event) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) {
      setError(EMPTY_TITLE_ERROR)
      inputRef.current.focus()
      return
    }
    onEdit(task.id, trimmed)
    stopEditing()
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') stopEditing()
  }

  if (isEditing) {
    return (
      <li className="task-item editing">
        <form className="edit-form" onSubmit={handleSave}>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label={`Edit title for ${task.title}`}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          <button type="submit" aria-label={`Save ${task.title}`}>
            Save
          </button>
          <button type="button" className="secondary" onClick={stopEditing} aria-label={`Cancel editing ${task.title}`}>
            Cancel
          </button>
          {error && (
            <p id={errorId} className="edit-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </li>
    )
  }

  return (
    <li className={task.completed ? 'task-item completed' : 'task-item'}>
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span>{task.title}</span>
      </label>
      <div className="task-actions">
        {priority && (
          <span className={`priority priority-${task.priority}`}>Priority: {priority}</span>
        )}
        <button ref={editButtonRef} className="edit" onClick={startEditing} aria-label={`Edit ${task.title}`}>
          Edit
        </button>
        <button className="delete" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}>
          Delete
        </button>
      </div>
    </li>
  )
}

export default TaskItem
