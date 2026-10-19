function SortSelect({ sort, onChange }) {
  return (
    <label className="sort-select">
      Sort by
      <select value={sort} onChange={(event) => onChange(event.target.value)}>
        <option value="added">Order added</option>
        <option value="title">Title (A–Z)</option>
      </select>
    </label>
  )
}

export default SortSelect
