import { getResponseExpectation, getResponseStatus } from '../../utils/responseTime'

interface ResponseIndicatorProps {
  lastActiveAt?: string
  className?: string
  showDot?: boolean
}

export default function ResponseIndicator({ 
  lastActiveAt, 
  className = '', 
  showDot = true 
}: ResponseIndicatorProps) {
  const expectation = getResponseExpectation(lastActiveAt)
  const status = getResponseStatus(lastActiveAt)
  
  return (
    <div className={`flex items-center text-sm text-gray-500 ${className}`}>
      {showDot && (
        <div 
          className={`h-2 w-2 rounded-full mr-2 ${
            status === 'fast' ? 'bg-green-400' : 'bg-yellow-400'
          }`}
        />
      )}
      <span>{expectation}</span>
    </div>
  )
}