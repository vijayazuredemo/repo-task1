import { useState } from 'react'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])

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

  return (
    <main className="app">
      <h1>Task Manager</h1>
      <TaskForm onAdd={addTask} />
      <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
      {tasks.length > 0 && (
        <p className="summary">
          {remaining} of {tasks.length} task{tasks.length === 1 ? '' : 's'} remaining
        </p>
      )}
    </main>
  )
}

export default App
