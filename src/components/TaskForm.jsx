import { useId, useRef, useState } from 'react'

const EMPTY_TITLE_ERROR = 'Please enter a task title.'

function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const errorId = useId()

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError(EMPTY_TITLE_ERROR)
      inputRef.current.focus()
      return
    }
    onAdd(trimmed)
    setTitle('')
    setError('')
  }

  function handleChange(event) {
    setTitle(event.target.value)
    setError('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={handleChange}
        placeholder="What needs to be done?"
        aria-label="New task"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      <button type="submit">Add</button>
      {error && (
        <p id={errorId} className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default TaskForm
