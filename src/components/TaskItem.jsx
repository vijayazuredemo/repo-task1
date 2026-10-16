function TaskItem({ task, onToggle, onDelete }) {
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
      <button className="delete" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}>
        Delete
      </button>
    </li>
  )
}

export default TaskItem
