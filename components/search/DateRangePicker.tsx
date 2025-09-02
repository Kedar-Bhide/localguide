import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useIsMobile } from '../../hooks/useMediaQuery'

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  isOpen = true,
  onOpenChange,
  className = ''
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)
  const isMobile = useIsMobile()

  const today = new Date()
  const startDateObj = startDate ? new Date(startDate) : undefined
  const endDateObj = endDate ? new Date(endDate) : undefined

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return formatDate(date1) === formatDate(date2)
  }

  const isInRange = (date: Date): boolean => {
    if (!startDateObj || !endDateObj) return false
    return date >= startDateObj && date <= endDateObj
  }

  const isRangeStart = (date: Date): boolean => {
    return startDateObj ? isSameDay(date, startDateObj) : false
  }

  const isRangeEnd = (date: Date): boolean => {
    return endDateObj ? isSameDay(date, endDateObj) : false
  }

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const days: Date[] = []
    
    // Add padding days from previous month
    const startPadding = firstDay.getDay()
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    // Add padding days from next month
    const totalCells = Math.ceil(days.length / 7) * 7
    const endPadding = totalCells - days.length
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date)
    
    if (selectingStart || !startDateObj) {
      // Select start date
      onDateRangeChange(dateStr, undefined)
      setSelectingStart(false)
    } else {
      // Select end date
      if (date < startDateObj) {
        // If selected date is before start, make it the new start
        onDateRangeChange(dateStr, undefined)
      } else {
        // Normal end date selection
        onDateRangeChange(startDate, dateStr)
        setSelectingStart(true) // Reset for next selection
      }
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const clearDates = () => {
    onDateRangeChange(undefined, undefined)
    setSelectingStart(true)
  }

  const setFlexibleDates = (days: number) => {
    const start = new Date(today)
    start.setDate(start.getDate() + 1) // Start tomorrow
    const end = new Date(start)
    end.setDate(end.getDate() + days - 1)
    
    onDateRangeChange(formatDate(start), formatDate(end))
    setSelectingStart(true)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = getDaysInMonth(currentMonth)

  // Desktop popover content
  const DesktopPopover = () => (
    <AnimatePresence>
      {isOpen && !isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute top-full mt-2 bg-white rounded-2xl shadow-soft border border-[color:var(--border)] overflow-hidden z-50 w-96"
        >
          <DatePickerContent />
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Mobile sheet content
  const MobileSheet = () => (
    <Dialog.Root open={isOpen && isMobile} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-hidden"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between p-6 border-b border-[color:var(--border)]">
              <h3 className="text-lg font-semibold text-[color:var(--ink)]">
                Select dates
              </h3>
              <Dialog.Close asChild>
                <button 
                  className="p-2 text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                  aria-label="Close date picker"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <DatePickerContent />
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

  // Shared date picker content
  const DatePickerContent = () => (
    <>
      {/* Flexible Date Options */}
      <div className="p-6 border-b border-[color:var(--border)]">
        <h3 className="text-lg font-semibold text-[color:var(--ink)] mb-4">When are you traveling?</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFlexibleDates(3)}
            className="btn-secondary text-sm py-2 focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
          >
            Weekend (3 days)
          </button>
          <button
            onClick={() => setFlexibleDates(7)}
            className="btn-secondary text-sm py-2 focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
          >
            Week (7 days)
          </button>
          <button
            onClick={() => setFlexibleDates(14)}
            className="btn-secondary text-sm py-2 focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
          >
            2 weeks
          </button>
          <button
            onClick={clearDates}
            className="btn-secondary text-sm py-2 focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
          >
            I&apos;m flexible
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-[color:var(--muted-ink)] py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
            const isPast = day < today
            const isSelected = isRangeStart(day) || isRangeEnd(day)
            const isInDateRange = isInRange(day)
            const isStartOfRange = isRangeStart(day)
            const isEndOfRange = isRangeEnd(day)

            return (
              <button
                key={index}
                onClick={() => !isPast && handleDateClick(day)}
                disabled={isPast}
                className={`
                  relative h-12 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2
                  ${!isCurrentMonth ? 'text-[color:var(--muted-ink)] opacity-30' : 'text-[color:var(--ink)]'}
                  ${isPast ? 'text-[color:var(--muted-ink)] cursor-not-allowed opacity-30' : 'hover:bg-[color:var(--bg-soft)] cursor-pointer'}
                  ${isSelected ? 'bg-[color:var(--brand)] text-white hover:bg-[color:var(--brand-600)]' : ''}
                  ${isInDateRange && !isSelected ? 'bg-[color:var(--brand)]/10 text-[color:var(--brand)]' : ''}
                  ${isStartOfRange && isEndOfRange ? 'rounded-xl' : ''}
                  ${isStartOfRange && !isEndOfRange ? 'rounded-l-xl rounded-r-sm' : ''}
                  ${isEndOfRange && !isStartOfRange ? 'rounded-r-xl rounded-l-sm' : ''}
                  ${isInDateRange && !isSelected && !isStartOfRange && !isEndOfRange ? 'rounded-sm' : ''}
                `}
                aria-label={`${day.getDate()} ${monthNames[day.getMonth()]} ${day.getFullYear()}`}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>

        {/* Selected Range Display */}
        <AnimatePresence>
          {startDateObj && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 p-4 bg-[color:var(--bg-soft)] rounded-xl"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[color:var(--brand)]" />
                <span className="text-sm text-[color:var(--ink)]">
                  <strong>
                    {startDateObj.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </strong>
                  {endDateObj && (
                    <>
                      {' - '}
                      <strong>
                        {endDateObj.toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </strong>
                    </>
                  )}
                  {!endDateObj && <span className="text-[color:var(--muted-ink)]"> → Select end date</span>}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )

  return (
    <div className={`relative ${className}`}>
      {/* Desktop Popover */}
      {!isMobile && <DesktopPopover />}
      
      {/* Mobile Sheet */}
      {isMobile && <MobileSheet />}
    </div>
  )
}