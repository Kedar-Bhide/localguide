import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Button from '../ui/Button'

interface MessageComposerProps {
  onSendMessage: (message: string) => Promise<void>
  disabled?: boolean
  sending?: boolean
  placeholder?: string
}

export default function MessageComposer({
  onSendMessage,
  disabled = false,
  sending = false,
  placeholder = "Type your message..."
}: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      // Min height of 20px, max height of 120px (about 6 lines)
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120)
      textarea.style.height = `${newHeight}px`
    }
  }

  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    adjustTextareaHeight()
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    // Shift+Enter allows newline (default behavior)
  }

  // Send message
  const handleSend = async () => {
    if (!message.trim() || sending || disabled) return

    try {
      await onSendMessage(message.trim())
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px'
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Adjust height on mount and when message changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end space-x-3">
        {/* Textarea Container */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className={`
              w-full px-4 py-3 pr-12
              border border-gray-300 rounded-lg
              text-sm placeholder-gray-500 
              resize-none overflow-hidden
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
              transition-colors duration-200
              ${disabled || sending ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            `}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              lineHeight: '1.5'
            }}
          />
          
          {/* Character/Line indicator (subtle) */}
          {message.length > 500 && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-400">
              {message.length}/1000
            </div>
          )}
          
          {/* Keyboard shortcut hint */}
          {!message && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
              Enter to send • Shift+Enter for new line
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || sending || !message.trim()}
          variant="primary"
          size="md"
          className="flex-shrink-0 h-11"
        >
          {sending ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          )}
        </Button>
      </div>

      {/* Additional Actions Bar */}
      {message && !sending && (
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Press Enter to send</span>
            <span>•</span>
            <span>Shift + Enter for new line</span>
          </div>
          {message.length > 0 && (
            <span className={message.length > 800 ? 'text-orange-500' : ''}>
              {message.length}/1000
            </span>
          )}
        </div>
      )}
    </div>
  )
}