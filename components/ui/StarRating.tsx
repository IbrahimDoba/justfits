'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const handleClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (interactive && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onChange(starIndex + 1)
    }
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            disabled={!interactive}
            className={cn(
              'relative focus:outline-none',
              interactive && 'cursor-pointer hover:scale-110 transition-transform',
              !interactive && 'cursor-default'
            )}
            aria-label={interactive ? `Rate ${i + 1} stars` : undefined}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(sizeClasses[size], 'text-gray-300')}
              strokeWidth={1.5}
            />
            {/* Foreground star (filled) - clipped based on rating */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={cn(sizeClasses[size], 'text-yellow-400 fill-yellow-400')}
                strokeWidth={1.5}
              />
            </div>
          </button>
        )
      })}
      {showValue && (
        <span className="ml-1.5 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
