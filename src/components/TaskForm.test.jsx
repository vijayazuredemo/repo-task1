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
    expect(onAdd).toHaveBeenCalledWith('Buy milk', 'medium')
    expect(input).toHaveValue('')
  })

  it('submits when Enter is pressed', async () => {
    const { onAdd, user, input } = renderForm()
    await user.type(input, 'Write report{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Write report', 'medium')
  })

  it('trims spaces around the title', async () => {
    const { onAdd, user, input, addButton } = renderForm()
    await user.type(input, '   Call mom   ')
    await user.click(addButton)
    expect(onAdd).toHaveBeenCalledWith('Call mom', 'medium')
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

describe('TaskForm priority', () => {
  it('defaults the priority to Medium', () => {
    renderForm()
    expect(screen.getByLabelText('Priority')).toHaveValue('medium')
  })

  it('calls onAdd with the chosen priority and resets it to Medium', async () => {
    const { onAdd, user, input, addButton } = renderForm()
    await user.type(input, 'File taxes')
    await user.selectOptions(screen.getByLabelText('Priority'), 'High')
    await user.click(addButton)
    expect(onAdd).toHaveBeenCalledWith('File taxes', 'high')
    expect(screen.getByLabelText('Priority')).toHaveValue('medium')
  })

  it('keeps the chosen priority when the title is rejected', async () => {
    const { onAdd, user, addButton } = renderForm()
    await user.selectOptions(screen.getByLabelText('Priority'), 'Low')
    await user.click(addButton)
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Priority')).toHaveValue('low')
  })
})

describe('TaskForm validation message', () => {
  const message = 'Please enter a task title.'

  it('shows no error before the user submits', () => {
    const { input } = renderForm()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it.each([
    ['an empty title', ''],
    ['a whitespace-only title', '   '],
  ])('explains the problem for %s and links it to the input', async (_label, typed) => {
    const { onAdd, user, input, addButton } = renderForm()
    if (typed) await user.type(input, typed)
    await user.click(addButton)

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(message)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(message)
  })

  it('moves focus back to the input after an invalid submit', async () => {
    const { user, input, addButton } = renderForm()
    await user.click(addButton)
    expect(input).toHaveFocus()
  })

  it('clears the error as soon as the user edits the title', async () => {
    const { user, input, addButton } = renderForm()
    await user.click(addButton)
    await user.type(input, 'B')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAccessibleDescription()
  })

  it('accepts the corrected title and shows no error afterwards', async () => {
    const { onAdd, user, input, addButton } = renderForm()
    await user.type(input, '   ')
    await user.click(addButton)
    await user.clear(input)
    await user.type(input, 'Buy milk')
    await user.click(addButton)

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith('Buy milk', 'medium')
    expect(input).toHaveValue('')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the error again on a second invalid attempt', async () => {
    const { user, input, addButton } = renderForm()
    await user.click(addButton)
    await user.type(input, '  ')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(addButton)
    expect(screen.getByRole('alert')).toHaveTextContent(message)
  })

  it('never shows an error for a valid submission', async () => {
    const { user, input, addButton } = renderForm()
    await user.type(input, 'Write report')
    await user.click(addButton)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
