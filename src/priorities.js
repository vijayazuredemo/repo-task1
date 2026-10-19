export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const DEFAULT_PRIORITY = 'medium'

export function priorityLabel(value) {
  return PRIORITIES.find((priority) => priority.value === value)?.label
}
