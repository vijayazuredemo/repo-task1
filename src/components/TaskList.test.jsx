import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TaskList from './TaskList.jsx'

describe('TaskList', () => {
  it('renders one list item per task, in order', () => {
    const tasks = [
      { id: '1', title: 'Buy milk', completed: false },
      { id: '2', title: 'Write report', completed: true },
    ]
    render(<TaskList tasks={tasks} emptyMessage="unused" onToggle={vi.fn()} onDelete={vi.fn()} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Buy milk')
    expect(items[1]).toHaveTextContent('Write report')
    expect(screen.queryByText('unused')).not.toBeInTheDocument()
  })

  it('shows the empty message and no list when there are no tasks', () => {
    render(
      <TaskList
        tasks={[]}
        emptyMessage='No tasks match "xyz". Try a different search.'
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('No tasks match "xyz". Try a different search.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
