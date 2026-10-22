const STORAGE_KEY = 'trs_requests'
const EMPTY_MARKER_KEY = 'trs_requests_empty'

export function loadRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load requests from storage:', error)
    return []
  }
}

export function hasEmptyMarker() {
  return localStorage.getItem(EMPTY_MARKER_KEY) === '1'
}

export function setEmptyMarker() {
  localStorage.setItem(EMPTY_MARKER_KEY, '1')
}

export function clearEmptyMarker() {
  localStorage.removeItem(EMPTY_MARKER_KEY)
}

export function saveRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    if (requests.length === 0) {
      setEmptyMarker()
    } else {
      clearEmptyMarker()
    }
    return true
  } catch (error) {
    console.error('Failed to save requests to storage:', error)
    return false
  }
}

export function clearRequests() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    clearEmptyMarker()
    return true
  } catch (error) {
    console.error('Failed to clear requests from storage:', error)
    return false
  }
}
