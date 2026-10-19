import TaskItem from './TaskItem.jsx'

function TaskList({ tasks, emptyMessage, onToggle, onDelete, onEdit }) {
  if (tasks.length === 0) {
    return <p className="empty">{emptyMessage}</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}

export default TaskList
