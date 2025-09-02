/**
 * Utility functions for computing response expectation indicators
 */

/**
 * Get response expectation text based on last_active_at
 * "Usually responds within a day" if last_active_at within 24h
 * "Typically replies within a few days" otherwise
 */
export function getResponseExpectation(lastActiveAt?: string): string {
  if (!lastActiveAt) {
    return 'Typically replies within a few days'
  }
  
  const now = new Date()
  const lastActive = new Date(lastActiveAt)
  const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
  
  // Within 24 hours - fast responder
  if (diffHours <= 24) {
    return 'Usually responds within a day'
  }
  
  // More than 24 hours - slower responder
  return 'Typically replies within a few days'
}

/**
 * Get response indicator status for styling
 * 'fast' for within 24h, 'normal' for longer
 */
export function getResponseStatus(lastActiveAt?: string): 'fast' | 'normal' {
  if (!lastActiveAt) {
    return 'normal'
  }
  
  const now = new Date()
  const lastActive = new Date(lastActiveAt)
  const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
  
  return diffHours <= 24 ? 'fast' : 'normal'
}