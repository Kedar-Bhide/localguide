export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2
}

export const validateTags = (tags: string[]): boolean => {
  return tags.length <= 4 && tags.every(tag => tag.trim().length > 0)
}

export const validateBio = (bio: string): boolean => {
  return bio.trim().length <= 500
}