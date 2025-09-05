import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm')
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday'
  }
  
  return format(dateObj, 'MMM d')
}

export function formatTime(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm')
}

export function formatRelativeTime(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function formatFullDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMMM d, yyyy')
}

export function generateAvatarUrl(name: string, size: number = 40) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=0ea5e9&color=ffffff&format=svg`
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncateText(text: string, length: number = 100) {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string) {
  return password.length >= 6
}

export function formatNumber(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}

export function generateRandomId(length: number = 8) {
  return Math.random().toString(36).substring(2, 2 + length)
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function capitalizeWords(text: string) {
  return text.replace(/\b\w/g, l => l.toUpperCase())
}

export function getColorForString(str: string) {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ]
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export function parseSearchParams(searchParams: URLSearchParams) {
  const params: Record<string, string | string[]> = {}
  
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value)
      } else {
        params[key] = [params[key] as string, value]
      }
    } else {
      params[key] = value
    }
  }
  
  return params
}

export function buildSearchParams(params: Record<string, any>) {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)))
      } else {
        searchParams.set(key, String(value))
      }
    }
  })
  
  return searchParams
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isImageFile(filename: string) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return imageExtensions.includes(ext)
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot get random element from empty array')
  }
  return array[Math.floor(Math.random() * array.length)]!
}

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j]!, newArray[i]!]
  }
  return newArray
}