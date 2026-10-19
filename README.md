# Task Manager

A small React app for keeping a to-do list. Tasks live in memory only: there is no backend or database.

**Features**
- Add tasks. Empty or spaces-only titles are rejected with an accessible error message.
- Mark tasks complete or not complete with the checkbox.
- Edit a title inline: **Save** or Enter to save, **Cancel** or Escape to cancel. Blank titles are rejected.
- Delete tasks.
- Search titles. Search ignores upper/lower case and surrounding spaces, and matches part of a title.
- Filter by **All**, **Active** or **Completed**.
- Sort by **Order added** or **Title (A–Z)**.

## Prerequisites

- **Node.js 20 (20.9 or newer), 22, or 24+.** Vitest 4 needs Node 20, 22 or 24+, and ESLint 9 needs 20.9 or newer on the Node 20 line. Developed with Node 20.18.0.
- **npm** (comes with Node.js). Developed with npm 10.8.2.
- A modern browser (Chrome, Edge, Firefox or Safari).

Check your versions:

```bash
node -v
npm -v
```

## Getting started

```bash
git clone https://github.com/vijayazuredemo/repo-task1.git
cd repo-task1
npm install
npm run dev
```

Open the "Local" URL that Vite prints, normally <http://localhost:5173>. If that port is busy, Vite uses the next free one, such as 5174. Edits to files in `src/` show up in the browser straight away.

To open the app from another device on your network (for example, your phone), start it with `npm run dev -- --host` and use the "Network" URL that Vite prints.

### Production build

```bash
npm run build     # writes an optimized build to dist/
npm run preview   # serves dist/, normally at http://localhost:4173 (next free port if busy)
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run all tests once (`vitest run`) |
| `npm run coverage` | Run all tests with a coverage report |
| `npm run lint` | Check the code with ESLint |

## Testing

### Test framework

- **[Vitest](https://vitest.dev/)** runs the tests. It shares its configuration with Vite: see the `test` section in `vite.config.js`.
- **[jsdom](https://github.com/jsdom/jsdom)** provides a simulated browser, so tests run in Node without opening a real browser.
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** renders components and finds elements the way a user would (by role, label and text).
- **[user-event](https://testing-library.com/docs/user-event/intro)** simulates real typing, clicking and key presses.
- **[jest-dom](https://github.com/testing-library/jest-dom)** adds DOM matchers such as `toBeInTheDocument()` and `toBeChecked()`. It is loaded in `src/setupTests.js`.

### Where the tests are

| File | What it covers |
|---|---|
| `src/App.test.jsx` | The whole app working together: adding, completing, editing, deleting, search, filters, sorting, validation and duplicate titles |
| `src/components/*.test.jsx` | Each component on its own, next to the component file |

### Running tests

```bash
npm test                                          # run every test once
npx vitest watch                                  # watch mode: reruns tests when files change (press q to quit)
npx vitest run src/components/TaskItem.test.jsx   # run one test file
npx vitest run -t "sorting tasks"                 # run tests whose name matches the text
```

### Coverage

```bash
npm run coverage
```

This prints a coverage table in the terminal and writes an HTML report to `coverage/index.html`. Open the report in a browser and click a file to see which lines ran during the tests. The report is regenerated on every run and is ignored by Git.

Coverage is only reported, not enforced: no minimum percentage makes the run fail. `src/main.jsx` shows as uncovered because the tests render `<App />` directly instead of starting the app through its entry point.

`@vitest/coverage-v8` must stay on the same version as `vitest`. If you upgrade one, upgrade both.

## Project structure

```text
index.html               page shell that loads src/main.jsx
vite.config.js           Vite and Vitest configuration
eslint.config.js         ESLint rules
src/
  main.jsx               mounts <App /> into the page
  App.jsx                holds the task list and the search, filter and sort settings
  App.css                styles
  setupTests.js          test setup (jest-dom matchers, cleanup after each test)
  components/
    TaskForm.jsx         new-task input and validation
    SearchBox.jsx        search input
    FilterBar.jsx        All / Active / Completed buttons
    SortSelect.jsx       sort dropdown
    TaskList.jsx         the list, or a message when nothing is shown
    TaskItem.jsx         one task row: checkbox, title, Edit, Delete, inline edit form
```

## Known limitations

- **No saving.** Tasks are held in memory only, so refreshing or closing the page clears them. The search, filter and sort settings also reset.
- **Single user, single device.** There is no backend, no accounts and no syncing between browser tabs or devices.
- **Limited sorting.** You can sort by order added or by title A–Z only. There are no due dates or priorities, and tasks can't be reordered by dragging.
- **Duplicate titles are allowed.** For tasks with the same title, the buttons have the same accessible name (for example, two "Delete Buy milk" buttons), so screen-reader users can't tell those rows apart by name alone.
- **No title length limit.** Very long titles are accepted.
- **No end-to-end tests.** The tests run in jsdom, a simulated browser. Real-browser behavior, such as how the CSS looks, is not tested automatically.
- **No CI.** No checks run automatically on pull requests. Run `npm test`, `npm run lint` and `npm run build` before you push.
