import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void
  className?: string
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  className = ''
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)

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

  return (
    <div className={`bg-white ${className}`}>
      {/* Flexible Date Options */}
      <div className="p-6 border-b border-[color:var(--border)]">
        <h3 className="text-lg font-semibold text-[color:var(--ink)] mb-4">When are you traveling?</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFlexibleDates(3)}
            className="btn-secondary text-sm py-2"
          >
            Weekend (3 days)
          </button>
          <button
            onClick={() => setFlexibleDates(7)}
            className="btn-secondary text-sm py-2"
          >
            Week (7 days)
          </button>
          <button
            onClick={() => setFlexibleDates(14)}
            className="btn-secondary text-sm py-2"
          >
            2 weeks
          </button>
          <button
            onClick={clearDates}
            className="btn-secondary text-sm py-2"
          >
            I'm flexible
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
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
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
                  ${!isCurrentMonth ? 'text-[color:var(--muted-ink)] opacity-30' : ''}
                  ${isPast ? 'text-[color:var(--muted-ink)] cursor-not-allowed opacity-30' : 'hover:bg-[color:var(--bg-soft)]'}
                  ${isSelected ? 'bg-[color:var(--brand)] text-white hover:bg-[color:var(--brand-600)]' : ''}
                  ${isInDateRange && !isSelected ? 'bg-[color:var(--brand)]/10 text-[color:var(--brand)]' : ''}
                  ${isStartOfRange ? 'rounded-r-md' : ''}
                  ${isEndOfRange ? 'rounded-l-md' : ''}
                  ${isInDateRange && !isSelected ? 'rounded-none' : ''}
                `}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>

        {/* Selected Range Display */}
        {startDateObj && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-[color:var(--bg-soft)] rounded-xl"
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[color:var(--brand)]" />
              <span className="text-sm text-[color:var(--ink)]">
                {startDateObj.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
                {endDateObj && (
                  <>
                    {' - '}
                    {endDateObj.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </>
                )}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}