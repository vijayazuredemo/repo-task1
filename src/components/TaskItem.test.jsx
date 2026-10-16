import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskItem from './TaskItem.jsx'

function renderItem(task) {
  const onToggle = vi.fn()
  const onDelete = vi.fn()
  const user = userEvent.setup()
  render(
    <ul>
      <TaskItem task={task} onToggle={onToggle} onDelete={onDelete} />
    </ul>,
  )
  return { onToggle, onDelete, user }
}

describe('TaskItem', () => {
  it('renders an incomplete task unchecked and not styled as completed', () => {
    renderItem({ id: 'a1', title: 'Buy milk', completed: false })
    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).not.toBeChecked()
    expect(screen.getByRole('listitem')).not.toHaveClass('completed')
  })

  it('renders a completed task checked and styled as completed', () => {
    renderItem({ id: 'a1', title: 'Buy milk', completed: true })
    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked()
    expect(screen.getByRole('listitem')).toHaveClass('completed')
  })

  it('calls onToggle with the task id when the checkbox is clicked', async () => {
    const { onToggle, onDelete, user } = renderItem({ id: 'a1', title: 'Buy milk', completed: false })
    await user.click(screen.getByRole('checkbox', { name: 'Buy milk' }))
    expect(onToggle).toHaveBeenCalledWith('a1')
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('calls onDelete with the task id when Delete is clicked', async () => {
    const { onToggle, onDelete, user } = renderItem({ id: 'a1', title: 'Buy milk', completed: false })
    await user.click(screen.getByRole('button', { name: 'Delete Buy milk' }))
    expect(onDelete).toHaveBeenCalledWith('a1')
    expect(onToggle).not.toHaveBeenCalled()
  })
})
