export const ROUTES = {
  HOME: '/',
  JOIN: '/join',
  LOGIN: '/login',
  TRAVELER_SIGNUP: '/traveler',
  LOCAL_SIGNUP: '/local',
  EXPLORE: '/explore',
  REQUESTS: '/requests',
  CONNECT_WITH_LOCALS: '/connect-with-locals',
  MESSAGES: '/messages',
  FEEDBACK: '/feedback'
} as const

export const ROLES = {
  TRAVELER: 'traveler',
  LOCAL: 'local'
} as const

export const AUTH_EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  USER_UPDATED: 'USER_UPDATED'
} as const

export const MAX_TAGS = 4
export const MAX_BIO_LENGTH = 500
export const MAX_MESSAGE_LENGTH = 1000

export const SEARCH_DEBOUNCE_MS = 300
export const CHAT_POLL_INTERVAL_MS = 2000