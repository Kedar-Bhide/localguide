interface TimeSeparatorProps {
  timestamp: string
}

export default function TimeSeparator({ timestamp }: TimeSeparatorProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    // If it's today
    if (messageDate.getTime() === today.getTime()) {
      return 'Today'
    }
    
    // If it's yesterday
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    }
    
    // If it's within the last week
    const diffDays = Math.floor((today.getTime() - messageDate.getTime()) / (24 * 60 * 60 * 1000))
    if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' })
    }
    
    // For older dates
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full whitespace-nowrap">
          {formatTimestamp(timestamp)}
        </span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </div>
  )
}