import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SortSelect from './SortSelect.jsx'

describe('SortSelect', () => {
  it('offers Order added and Title (A–Z) under a "Sort by" label', () => {
    render(<SortSelect sort="added" onChange={vi.fn()} />)
    const select = screen.getByLabelText('Sort by')
    expect(select).toHaveValue('added')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Order added',
      'Title (A–Z)',
    ])
  })

  it('shows the current sort', () => {
    render(<SortSelect sort="title" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Sort by')).toHaveValue('title')
  })

  it('calls onChange with the chosen sort', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SortSelect sort="added" onChange={onChange} />)
    await user.selectOptions(screen.getByLabelText('Sort by'), 'Title (A–Z)')
    expect(onChange).toHaveBeenCalledWith('title')
  })
})
