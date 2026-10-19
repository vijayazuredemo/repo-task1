import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskItem from './TaskItem.jsx'

function renderItem(task) {
  const onToggle = vi.fn()
  const onDelete = vi.fn()
  const onEdit = vi.fn()
  const user = userEvent.setup()
  render(
    <ul>
      <TaskItem task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    </ul>,
  )
  return { onToggle, onDelete, onEdit, user }
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

describe('TaskItem editing', () => {
  const task = { id: 7, title: 'Buy milk', completed: true }
  const message = 'Please enter a task title.'
  const titleInput = () => screen.getByRole('textbox', { name: 'Edit title for Buy milk' })
  const saveButton = () => screen.getByRole('button', { name: 'Save Buy milk' })
  const cancelButton = () => screen.getByRole('button', { name: 'Cancel editing Buy milk' })

  async function startEditing() {
    const result = renderItem(task)
    await result.user.click(screen.getByRole('button', { name: 'Edit Buy milk' }))
    return result
  }

  it('switches to an edit box filled with the current title and focuses it', async () => {
    await startEditing()
    expect(titleInput()).toHaveValue('Buy milk')
    expect(titleInput()).toHaveFocus()
    expect(saveButton()).toBeInTheDocument()
    expect(cancelButton()).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete Buy milk' })).not.toBeInTheDocument()
  })

  it('saves the trimmed title with the task id and returns focus to Edit', async () => {
    const { user, onEdit, onToggle, onDelete } = await startEditing()
    await user.clear(titleInput())
    await user.type(titleInput(), '  Buy oat milk  ')
    await user.click(saveButton())

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(7, 'Buy oat milk')
    expect(onToggle).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit Buy milk' })).toHaveFocus()
  })

  it('saves when Enter is pressed', async () => {
    const { user, onEdit } = await startEditing()
    await user.clear(titleInput())
    await user.type(titleInput(), 'Buy bread{Enter}')
    expect(onEdit).toHaveBeenCalledWith(7, 'Buy bread')
  })

  it.each([
    ['clicking Cancel', async (user) => user.click(cancelButton())],
    ['pressing Escape', async (user) => user.keyboard('{Escape}')],
  ])('discards changes when %s', async (_label, cancel) => {
    const { user, onEdit } = await startEditing()
    await user.clear(titleInput())
    await user.type(titleInput(), 'Something else')
    await cancel(user)

    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Edit Buy milk' })).toHaveFocus()
  })

  it('starts from the saved title again after a cancelled edit', async () => {
    const { user } = await startEditing()
    await user.type(titleInput(), ' extra')
    await user.click(cancelButton())
    await user.click(screen.getByRole('button', { name: 'Edit Buy milk' }))
    expect(titleInput()).toHaveValue('Buy milk')
  })

  it.each([
    ['an empty title', ''],
    ['a whitespace-only title', '   '],
  ])('rejects %s and explains why', async (_label, typed) => {
    const { user, onEdit } = await startEditing()
    await user.clear(titleInput())
    if (typed) await user.type(titleInput(), typed)
    await user.click(saveButton())

    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(message)
    expect(titleInput()).toHaveAttribute('aria-invalid', 'true')
    expect(titleInput()).toHaveAccessibleDescription(message)
    expect(titleInput()).toHaveFocus()
  })

  it('clears the error on edit and saves the corrected title', async () => {
    const { user, onEdit } = await startEditing()
    await user.clear(titleInput())
    await user.keyboard('{Enter}')
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.type(titleInput(), 'Buy cheese')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(titleInput()).not.toHaveAttribute('aria-invalid')
    await user.click(saveButton())
    expect(onEdit).toHaveBeenCalledWith(7, 'Buy cheese')
  })

  it('drops the error when a rejected edit is cancelled', async () => {
    const { user } = await startEditing()
    await user.clear(titleInput())
    await user.click(saveButton())
    await user.click(cancelButton())
    await user.click(screen.getByRole('button', { name: 'Edit Buy milk' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Buy milk')
  })
})
