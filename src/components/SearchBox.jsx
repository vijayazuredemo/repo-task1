function SearchBox({ query, onChange }) {
  return (
    <input
      type="search"
      className="search-box"
      value={query}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search tasks..."
      aria-label="Search tasks"
    />
  )
}

export default SearchBox
