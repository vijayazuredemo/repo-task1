import { useState } from 'react'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import SearchBox from './components/SearchBox.jsx'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [query, setQuery] = useState('')

  function addTask(title) {
    const newTask = { id: crypto.randomUUID(), title, completed: false }
    setTasks((prev) => [...prev, newTask])
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const remaining = tasks.filter((task) => !task.completed).length

  const normalizedQuery = query.trim().toLowerCase()
  const visibleTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(normalizedQuery),
  )
  const emptyMessage =
    tasks.length === 0
      ? 'No tasks yet. Add one above.'
      : `No tasks match "${query.trim()}". Try a different search.`

  return (
    <main className="app">
      <h1>Task Manager</h1>
      <TaskForm onAdd={addTask} />
      {tasks.length > 0 && <SearchBox query={query} onChange={setQuery} />}
      <TaskList
        tasks={visibleTasks}
        emptyMessage={emptyMessage}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
      {tasks.length > 0 && (
        <p className="summary">
          {remaining} of {tasks.length} task{tasks.length === 1 ? '' : 's'} remaining
        </p>
      )}
    </main>
  )
}

export default App
