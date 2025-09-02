interface TypingIndicatorProps {
  senderName?: string
  avatar?: string
}

export default function TypingIndicator({ senderName, avatar }: TypingIndicatorProps) {
  return (
    <div className="flex items-end space-x-2 justify-start mt-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={senderName || 'User'}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">
              {senderName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </div>

      {/* Typing Bubble */}
      <div className="flex flex-col max-w-xs sm:max-w-md lg:max-w-lg items-start">
        {/* Sender Name */}
        {senderName && (
          <span className="text-xs font-medium text-gray-600 mb-1 px-1">
            {senderName}
          </span>
        )}

        {/* Typing Bubble */}
        <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">typing...</span>
          </div>
        </div>
      </div>
    </div>
  )
}