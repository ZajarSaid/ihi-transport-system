import { useState, useEffect, useCallback } from 'react'

/**
 * A server that answers with an error status is not an outage: the message
 * ("attach your signature", "only draft requests can be submitted") has to
 * reach the screen that asked. Only a network failure falls back to the
 * browser store, so the user is never told a request was saved when the
 * server refused it.
 */
class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function apiFetch(url, options = {}) {
  let res
  try {
    res = await fetch(url, { cache: 'no-store', ...options })
  } catch {
    const error = new Error('The server could not be reached.')
    error.offline = true
    throw error
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(
      (data && data.error) || `The request failed (${res.status}).`,
      res.status,
    )
  }
  return data
}

function jsonPost(body) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export function useRequests() {
  const [state, setState] = useState({ requests: [], loading: true, error: null })

  const fetchRequests = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const requests = await apiFetch('/api/requests')
      setState({
        requests: Array.isArray(requests) ? requests : [],
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        requests: [],
        loading: false,
        error: err.message || 'Failed to load requests',
      }))
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  /** Reload without the "Loading requests..." flash. */
  const refresh = useCallback(async () => {
    try {
      const requests = await apiFetch('/api/requests')
      setState({
        requests: Array.isArray(requests) ? requests : [],
        loading: false,
        error: null,
      })
      return requests
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load requests',
      }))
      return null
    }
  }, [])

  /** Merge one request into the list without a full reload. */
  const mergeRequest = useCallback((updated) => {
    if (!updated) return
    setState((prev) => ({
      ...prev,
      requests: prev.requests.map((req) => (req.id === updated.id ? updated : req)),
    }))
  }, [])

  const addRequest = useCallback(
    async (requestData) => {
      try {
        const data = await apiFetch('/api/requests', jsonPost(requestData))
        setState((prev) => ({ ...prev, requests: [data, ...prev.requests] }))
        refresh()
        return data
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        const created = requestService.createRequest(requestData)
        setState((prev) => ({ ...prev, requests: [created, ...prev.requests] }))
        return created
      }
    },
    [refresh],
  )

  const updateRequest = useCallback(
    async (id, updates) => {
      try {
        const data = await apiFetch(`/api/requests/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        mergeRequest(data)
        return data
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        const updated = requestService.updateRequest(id, updates)
        mergeRequest(updated)
        return updated
      }
    },
    [mergeRequest],
  )

  const submitRequest = useCallback(
    async (id) => {
      try {
        const data = await apiFetch(`/api/requests/${id}/submit`, { method: 'POST' })
        mergeRequest(data)
        refresh()
        return data
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        const updated = requestService.submitRequest(id)
        mergeRequest(updated)
        return updated
      }
    },
    [mergeRequest, refresh],
  )

  const setCostCenterApproval = useCallback(
    async (id, approval) => {
      try {
        const data = await apiFetch(
          `/api/requests/${id}/approvals/cost-center`,
          jsonPost(approval),
        )
        mergeRequest(data)
        refresh()
        return data
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        const updated = requestService.setCostCenterApproval(id, approval)
        mergeRequest(updated)
        return updated
      }
    },
    [mergeRequest, refresh],
  )

  const setBranchManagerApproval = useCallback(
    async (id, approval) => {
      try {
        const data = await apiFetch(
          `/api/requests/${id}/approvals/branch-manager`,
          jsonPost(approval),
        )
        mergeRequest(data)
        refresh()
        return data
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        const updated = requestService.setBranchManagerApproval(id, approval)
        mergeRequest(updated)
        return updated
      }
    },
    [mergeRequest, refresh],
  )

  const setFundsConfirmation = useCallback(
    async (id, confirmation) => {
      try {
        const data = await apiFetch(
          `/api/requests/${id}/approvals/accountant`,
          jsonPost(confirmation),
        )
        mergeRequest(data)
        refresh()
        return data
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        const updated = requestService.setFundsConfirmation(id, confirmation)
        mergeRequest(updated)
        return updated
      }
    },
    [mergeRequest, refresh],
  )

  const assignDrivers = useCallback(
    async (id, allocation) => {
      try {
        const data = await apiFetch(
          `/api/requests/${id}/allocation`,
          jsonPost(allocation),
        )
        mergeRequest(data)
        refresh()
        return data
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        const updated = requestService.assignDrivers(id, allocation)
        mergeRequest(updated)
        return updated
      }
    },
    [mergeRequest, refresh],
  )

  const markCompleted = useCallback(
    async (id) => {
      try {
        const data = await apiFetch(`/api/requests/${id}/complete`, { method: 'POST' })
        mergeRequest(data)
        refresh()
        return data
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        const updated = requestService.markCompleted(id)
        mergeRequest(updated)
        return updated
      }
    },
    [mergeRequest, refresh],
  )

  const removeRequest = useCallback(
    async (id) => {
      try {
        await apiFetch(`/api/requests/${id}`, { method: 'DELETE' })
        setState((prev) => ({
          ...prev,
          requests: prev.requests.filter((req) => req.id !== id),
        }))
        return true
      } catch (err) {
        if (!err.offline) throw err
        const { default: requestService } = require('../services/requestService')
        requestService.deleteRequest(id)
        setState((prev) => ({
          ...prev,
          requests: prev.requests.filter((req) => req.id !== id),
        }))
        return true
      }
    },
    [],
  )

  const removeOwnedRequests = useCallback(
    async (ownerId) => {
      const drafts = state.requests.filter(
        (req) => req.createdBy === ownerId && req.status === 'Draft',
      )
      for (const draft of drafts) {
        await removeRequest(draft.id)
      }
      return true
    },
    [removeRequest, state.requests],
  )

  const resetRequests = useCallback(() => {
    const { default: requestService } = require('../services/requestService')
    const requests = requestService.resetRequests()
    setState({ requests, loading: false, error: null })
    refresh()
    return requests
  }, [refresh])

  return {
    requests: state.requests,
    loading: state.loading,
    error: state.error,
    refresh,
    addRequest,
    createRequest: addRequest,
    updateRequest,
    submitRequest,
    setCostCenterApproval,
    setBranchManagerApproval,
    setFundsConfirmation,
    assignDrivers,
    markCompleted,
    removeRequest,
    removeOwnedRequests,
    resetRequests,
  }
}
