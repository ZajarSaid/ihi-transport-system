import { ROLES } from '../data/users'

export function canViewRequest(user, request) {
  if (!user || !request) return false
  if (user.role === ROLES.APPLICANT) {
    return request.createdBy === user.id
  }
  return true
}
