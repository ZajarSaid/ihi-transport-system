export function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

export function isValidPhone(phone) {
  const pattern = /^[+]?[\d\s()-]{7,}$/
  return pattern.test(phone)
}
