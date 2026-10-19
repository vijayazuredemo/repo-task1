import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterBar from './FilterBar.jsx'

describe('FilterBar', () => {
  it('shows All, Active and Completed in a labelled group', () => {
    render(<FilterBar filter="all" onChange={vi.fn()} />)
    const group = screen.getByRole('group', { name: 'Filter tasks' })
    expect(within(group).getAllByRole('button').map((b) => b.textContent)).toEqual([
      'All',
      'Active',
      'Completed',
    ])
  })

  it.each([
    ['all', 'All'],
    ['active', 'Active'],
    ['completed', 'Completed'],
  ])('marks only the current filter (%s) as pressed', (filter, label) => {
    render(<FilterBar filter={filter} onChange={vi.fn()} />)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-pressed', String(button.textContent === label))
    }
  })

  it('calls onChange with the chosen filter', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<FilterBar filter="all" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Active' }))
    await user.click(screen.getByRole('button', { name: 'Completed' }))
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(onChange.mock.calls).toEqual([['active'], ['completed'], ['all']])
  })
})
