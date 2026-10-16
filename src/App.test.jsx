import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

async function setup(titles = []) {
  const user = userEvent.setup()
  render(<App />)
  for (const title of titles) {
    await user.type(screen.getByLabelText('New task'), title)
    await user.click(screen.getByRole('button', { name: 'Add' }))
  }
  return user
}

function visibleTitles() {
  return screen.queryAllByRole('listitem').map((item) => item.textContent.replace('Delete', ''))
}

describe('Task Manager', () => {
  it('shows the empty message and no search box when there are no tasks', async () => {
    await setup()
    expect(screen.getByText('No tasks yet. Add one above.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Search tasks')).not.toBeInTheDocument()
  })

  it('adds tasks and ignores blank input', async () => {
    const user = await setup(['Buy milk'])
    await user.type(screen.getByLabelText('New task'), '   ')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(visibleTitles()).toEqual(['Buy milk'])
    expect(screen.getByText('1 of 1 task remaining')).toBeInTheDocument()
  })

  it('ignores clicking Add with an empty title', async () => {
    const user = await setup()
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(visibleTitles()).toEqual([])
    expect(screen.getByText('No tasks yet. Add one above.')).toBeInTheDocument()
  })

  it('trims spaces around a new task title', async () => {
    await setup(['   Buy milk   '])
    expect(visibleTitles()).toEqual(['Buy milk'])
  })

  it('marks a task complete and back', async () => {
    const user = await setup(['Buy milk', 'Write report'])
    const checkbox = screen.getByRole('checkbox', { name: 'Buy milk' })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(screen.getByText('1 of 2 tasks remaining')).toBeInTheDocument()
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('deletes a task', async () => {
    const user = await setup(['Buy milk', 'Write report'])
    await user.click(screen.getByRole('button', { name: 'Delete Buy milk' }))
    expect(visibleTitles()).toEqual(['Write report'])
  })

  it('shows the empty message again after deleting the last task', async () => {
    const user = await setup(['Buy milk'])
    await user.click(screen.getByRole('button', { name: 'Delete Buy milk' }))
    expect(visibleTitles()).toEqual([])
    expect(screen.getByText('No tasks yet. Add one above.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Search tasks')).not.toBeInTheDocument()
  })

  it('filters tasks by title, ignoring case and surrounding spaces', async () => {
    const user = await setup(['Buy milk', 'Write REPORT', 'Call mom'])
    const search = screen.getByLabelText('Search tasks')

    await user.type(search, 'report')
    expect(visibleTitles()).toEqual(['Write REPORT'])

    await user.clear(search)
    await user.type(search, '  M  ')
    expect(visibleTitles()).toEqual(['Buy milk', 'Call mom'])

    await user.clear(search)
    expect(visibleTitles()).toEqual(['Buy milk', 'Write REPORT', 'Call mom'])
  })

  it('matches non-ASCII titles regardless of case', async () => {
    const user = await setup(['Straße fegen', 'ΟΔΟΣ καθαρισμός', 'ﬁle taxes', 'CAFE\u0301 order'])
    const search = screen.getByLabelText('Search tasks')
    const cases = [
      ['STRASSE', ['Straße fegen']],
      ['οδοσ', ['ΟΔΟΣ καθαρισμός']],
      ['FILE', ['ﬁle taxes']],
      ['caf\u00e9', ['CAFE\u0301 order']],
    ]
    for (const [query, expected] of cases) {
      await user.clear(search)
      await user.type(search, query)
      expect(visibleTitles()).toEqual(expected)
    }
  })

  it('shows a friendly message when nothing matches', async () => {
    const user = await setup(['Buy milk'])
    await user.type(screen.getByLabelText('Search tasks'), 'xyz')
    expect(visibleTitles()).toEqual([])
    expect(screen.getByText('No tasks match "xyz". Try a different search.')).toBeInTheDocument()
  })

  it('keeps complete, delete and the summary working while filtered', async () => {
    const user = await setup(['Buy milk', 'Buy bread', 'Call mom'])
    await user.type(screen.getByLabelText('Search tasks'), 'buy')

    await user.click(screen.getByRole('checkbox', { name: 'Buy milk' }))
    expect(screen.getByText('2 of 3 tasks remaining')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Buy bread' }))
    expect(visibleTitles()).toEqual(['Buy milk'])

    await user.type(screen.getByLabelText('New task'), 'Buy eggs')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(visibleTitles()).toEqual(['Buy milk', 'Buy eggs'])

    await user.clear(screen.getByLabelText('Search tasks'))
    expect(visibleTitles()).toEqual(['Buy milk', 'Call mom', 'Buy eggs'])
    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked()
  })
})

describe('rejecting invalid task titles', () => {
  const invalidTitles = [
    ['an empty title', ''],
    ['a single space', ' '],
    ['several spaces', '     '],
    ['non-breaking spaces', '\u00a0\u00a0'],
    ['a full-width space', '\u3000'],
  ]
  const submitMethods = [
    ['clicking Add', async (user) => user.click(screen.getByRole('button', { name: 'Add' }))],
    ['pressing Enter', async (user) => user.type(screen.getByLabelText('New task'), '{Enter}')],
  ]

  describe.each(submitMethods)('submitted by %s', (_method, submit) => {
    it.each(invalidTitles)('does not add a task for %s when the list is empty', async (_label, title) => {
      const user = await setup()
      if (title) await user.type(screen.getByLabelText('New task'), title)
      await submit(user)

      expect(visibleTitles()).toEqual([])
      expect(screen.getByText('No tasks yet. Add one above.')).toBeInTheDocument()
      expect(screen.queryByLabelText('Search tasks')).not.toBeInTheDocument()
    })

    it.each(invalidTitles)('leaves existing tasks unchanged for %s', async (_label, title) => {
      const user = await setup(['Buy milk', 'Write report'])
      if (title) await user.type(screen.getByLabelText('New task'), title)
      await submit(user)

      expect(visibleTitles()).toEqual(['Buy milk', 'Write report'])
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
      expect(screen.getByText('2 of 2 tasks remaining')).toBeInTheDocument()
    })
  })

  it('still accepts a valid title after an invalid attempt', async () => {
    const user = await setup()
    const input = screen.getByLabelText('New task')
    await user.type(input, '   {Enter}')
    expect(visibleTitles()).toEqual([])

    await user.clear(input)
    await user.type(input, 'Buy milk{Enter}')
    expect(visibleTitles()).toEqual(['Buy milk'])
  })
})
