import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './TaskForm.jsx'

function renderForm() {
  const onAdd = vi.fn()
  const user = userEvent.setup()
  render(<TaskForm onAdd={onAdd} />)
  const input = screen.getByLabelText('New task')
  const addButton = screen.getByRole('button', { name: 'Add' })
  return { onAdd, user, input, addButton }
}

describe('TaskForm', () => {
  it('calls onAdd with the typed title and clears the input', async () => {
    const { onAdd, user, input, addButton } = renderForm()
    await user.type(input, 'Buy milk')
    await user.click(addButton)
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith('Buy milk')
    expect(input).toHaveValue('')
  })

  it('submits when Enter is pressed', async () => {
    const { onAdd, user, input } = renderForm()
    await user.type(input, 'Write report{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Write report')
  })

  it('trims spaces around the title', async () => {
    const { onAdd, user, input, addButton } = renderForm()
    await user.type(input, '   Call mom   ')
    await user.click(addButton)
    expect(onAdd).toHaveBeenCalledWith('Call mom')
  })

  it('does not call onAdd for an empty title', async () => {
    const { onAdd, user, addButton } = renderForm()
    await user.click(addButton)
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('does not call onAdd for a whitespace-only title and keeps the input', async () => {
    const { onAdd, user, input, addButton } = renderForm()
    await user.type(input, '    ')
    await user.click(addButton)
    expect(onAdd).not.toHaveBeenCalled()
    expect(input).toHaveValue('    ')
  })
})
