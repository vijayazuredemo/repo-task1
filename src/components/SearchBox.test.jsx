import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBox from './SearchBox.jsx'

describe('SearchBox', () => {
  it('shows the current query', () => {
    render(<SearchBox query="milk" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Search tasks')).toHaveValue('milk')
  })

  it('calls onChange with the new value as the user types', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SearchBox query="" onChange={onChange} />)
    await user.type(screen.getByLabelText('Search tasks'), 'M')
    expect(onChange).toHaveBeenCalledWith('M')
  })
})
