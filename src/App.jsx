import { useRef, useState } from 'react'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import SearchBox from './components/SearchBox.jsx'
import FilterBar from './components/FilterBar.jsx'
import './App.css'

const STATUS_FILTERS = {
  all: () => true,
  active: (task) => !task.completed,
  completed: (task) => task.completed,
}

function foldCase(text) {
  return text.normalize('NFC').toUpperCase().toLowerCase()
}

function App() {
  const [tasks, setTasks] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const nextId = useRef(1)

  function addTask(title) {
    const newTask = { id: nextId.current++, title, completed: false }
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

  const trimmedQuery = query.trim()
  const normalizedQuery = foldCase(trimmedQuery)
  const visibleTasks = tasks.filter(
    (task) =>
      STATUS_FILTERS[filter](task) && foldCase(task.title).includes(normalizedQuery),
  )
  const filterWord = filter === 'all' ? '' : `${filter} `
  let emptyMessage
  if (tasks.length === 0) {
    emptyMessage = 'No tasks yet. Add one above.'
  } else if (trimmedQuery) {
    emptyMessage = `No ${filterWord}tasks match "${trimmedQuery}". Try a different search.`
  } else {
    emptyMessage = `No ${filterWord}tasks.`
  }

  return (
    <main className="app">
      <h1>Task Manager</h1>
      <TaskForm onAdd={addTask} />
      {tasks.length > 0 && <SearchBox query={query} onChange={setQuery} />}
      {tasks.length > 0 && <FilterBar filter={filter} onChange={setFilter} />}
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
