import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

describe('without crypto.randomUUID (plain HTTP on a non-localhost address)', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('still adds, completes and deletes tasks, keeping duplicates separate', async () => {
    expect(crypto.randomUUID).toBeUndefined()
    const user = await setup(['Buy milk', 'Buy milk', 'Write report'])
    expect(visibleTitles()).toEqual(['Buy milk', 'Buy milk', 'Write report'])

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])
    expect(checkboxes[0]).not.toBeChecked()
    expect(checkboxes[1]).toBeChecked()

    await user.click(screen.getAllByRole('button', { name: 'Delete Buy milk' })[0])
    expect(visibleTitles()).toEqual(['Buy milk', 'Write report'])
    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked()
    expect(screen.getByText('1 of 2 tasks remaining')).toBeInTheDocument()
  })
})

describe('deleting tasks', () => {
  const titles = ['Buy milk', 'Write report', 'Call mom']

  function taskStates() {
    return screen.queryAllByRole('listitem').map((item) => ({
      title: item.querySelector('span').textContent,
      completed: item.querySelector('input[type="checkbox"]').checked,
    }))
  }

  async function deleteTask(user, title) {
    await user.click(screen.getByRole('button', { name: `Delete ${title}` }))
  }

  it.each([
    ['first', 'Buy milk', '1 of 2 tasks remaining'],
    ['middle', 'Write report', '2 of 2 tasks remaining'],
    ['last', 'Call mom', '1 of 2 tasks remaining'],
  ])('deletes the %s task and leaves the others unchanged', async (_label, title, summary) => {
    const user = await setup(titles)
    await user.click(screen.getByRole('checkbox', { name: 'Write report' }))
    const before = taskStates()

    await deleteTask(user, title)

    expect(taskStates()).toEqual(before.filter((task) => task.title !== title))
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText(summary)).toBeInTheDocument()
  })

  it('removes exactly one task per click', async () => {
    const user = await setup(titles)
    await deleteTask(user, 'Write report')
    expect(visibleTitles()).toEqual(['Buy milk', 'Call mom'])
    await deleteTask(user, 'Buy milk')
    expect(visibleTitles()).toEqual(['Call mom'])
  })

  it('returns to the empty state after deleting the final task', async () => {
    const user = await setup(['Buy milk'])
    await user.click(screen.getByRole('checkbox', { name: 'Buy milk' }))
    await deleteTask(user, 'Buy milk')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByText('No tasks yet. Add one above.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Search tasks')).not.toBeInTheDocument()
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument()
  })

  it('returns to the empty state after deleting every task one by one', async () => {
    const user = await setup(titles)
    for (const title of ['Write report', 'Call mom', 'Buy milk']) {
      await deleteTask(user, title)
    }
    expect(visibleTitles()).toEqual([])
    expect(screen.getByText('No tasks yet. Add one above.')).toBeInTheDocument()
  })

  it('can add a new task after deleting the final task', async () => {
    const user = await setup(['Buy milk'])
    await deleteTask(user, 'Buy milk')
    await user.type(screen.getByLabelText('New task'), 'Call mom{Enter}')
    expect(taskStates()).toEqual([{ title: 'Call mom', completed: false }])
    expect(screen.getByText('1 of 1 task remaining')).toBeInTheDocument()
  })
})

describe('duplicate task titles', () => {
  function checkboxes() {
    return screen.getAllByRole('checkbox')
  }

  function deleteButtons(title) {
    return screen.getAllByRole('button', { name: `Delete ${title}` })
  }

  it('allows adding the same title more than once as separate tasks', async () => {
    await setup(['Buy milk', 'Buy milk', 'Buy milk'])
    expect(visibleTitles()).toEqual(['Buy milk', 'Buy milk', 'Buy milk'])
    expect(screen.getByText('3 of 3 tasks remaining')).toBeInTheDocument()
  })

  it.each([
    ['different case', ['Buy milk', 'BUY MILK'], ['Buy milk', 'BUY MILK']],
    ['surrounding spaces', ['Buy milk', '  Buy milk  '], ['Buy milk', 'Buy milk']],
  ])('keeps titles that differ only by %s as separate tasks', async (_label, typed, stored) => {
    await setup(typed)
    expect(visibleTitles()).toEqual(stored)
    expect(screen.getByText('2 of 2 tasks remaining')).toBeInTheDocument()
  })

  it('completes only the duplicate that was clicked', async () => {
    const user = await setup(['Buy milk', 'Buy milk'])
    await user.click(checkboxes()[1])
    expect(checkboxes()[0]).not.toBeChecked()
    expect(checkboxes()[1]).toBeChecked()
    expect(screen.getByText('1 of 2 tasks remaining')).toBeInTheDocument()
  })

  it.each([
    ['first', 0, 1],
    ['second', 1, 0],
  ])('deletes only the %s duplicate and keeps the other one\'s state', async (_label, deleted, kept) => {
    const user = await setup(['Buy milk', 'Buy milk'])
    await user.click(checkboxes()[kept])
    await user.click(deleteButtons('Buy milk')[deleted])
    expect(visibleTitles()).toEqual(['Buy milk'])
    expect(checkboxes()[0]).toBeChecked()
    expect(screen.getByText('0 of 1 task remaining')).toBeInTheDocument()
  })

  it('shows every duplicate in search results and acts on only the clicked one', async () => {
    const user = await setup(['Buy milk', 'Write report', 'buy MILK'])
    await user.type(screen.getByLabelText('Search tasks'), 'milk')
    expect(visibleTitles()).toEqual(['Buy milk', 'buy MILK'])
    await user.click(checkboxes()[0])
    expect(checkboxes()[0]).toBeChecked()
    expect(checkboxes()[1]).not.toBeChecked()
    await user.click(deleteButtons('buy MILK')[0])
    expect(visibleTitles()).toEqual(['Buy milk'])
    expect(screen.getByText('1 of 2 tasks remaining')).toBeInTheDocument()
  })

  it('gives duplicate rows the same accessible name for their Delete buttons', async () => {
    await setup(['Buy milk', 'Buy milk'])
    expect(deleteButtons('Buy milk')).toHaveLength(2)
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
