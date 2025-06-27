import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

// Bottom sheet para mobile
interface MobileBottomSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export const MobileBottomSheet = React.forwardRef<HTMLDivElement, MobileBottomSheetProps>(
  ({ className, isOpen, onClose, title, children, ...props }, ref) => {
    const isMobile = useIsMobile()

    if (!isMobile || !isOpen) return null

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div
          ref={ref}
          className={cn(
            "fixed bottom-0 left-0 right-0 bg-elite-card border-t border-elite-border rounded-t-2xl p-4 transform transition-transform duration-300",
            isOpen ? "translate-y-0" : "translate-y-full",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-elite-border">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-elite-primary-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-elite-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    )
  }
)

MobileBottomSheet.displayName = "MobileBottomSheet"

// Stack navigation para mobile
interface MobileStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end'
}

export const MobileStack = React.forwardRef<HTMLDivElement, MobileStackProps>(
  ({ className, spacing = 'md', align = 'start', children, ...props }, ref) => {
    const spacingClasses = {
      sm: 'space-y-2',
      md: 'space-y-4', 
      lg: 'space-y-6'
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col w-full',
          spacingClasses[spacing],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MobileStack.displayName = "MobileStack"

// Touch-friendly button para mobile
interface MobileTouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const MobileTouchButton = React.forwardRef<HTMLButtonElement, MobileTouchButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-elite-button text-white hover:bg-elite-secondary shadow-glow active:shadow-elite',
      secondary: 'bg-elite-primary-800 text-elite-primary-200 hover:bg-elite-primary-700 hover:text-white',
      outline: 'border border-elite-border bg-transparent hover:bg-elite-primary-800/50 text-elite-primary-300 hover:text-white',
      ghost: 'hover:bg-elite-primary-800/50 text-elite-primary-300 hover:text-white'
    }

    const sizeClasses = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg'
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 touch-manipulation active:scale-95',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

MobileTouchButton.displayName = "MobileTouchButton"

// Swipeable card para mobile
interface MobileSwipeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export const MobileSwipeCard = React.forwardRef<HTMLDivElement, MobileSwipeCardProps>(
  ({ className, onSwipeLeft, onSwipeRight, children, ...props }, ref) => {
    const [startX, setStartX] = React.useState<number | null>(null)

    const handleTouchStart = (e: React.TouchEvent) => {
      setStartX(e.touches[0].clientX)
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (!startX) return

      const endX = e.changedTouches[0].clientX
      const diff = startX - endX

      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0 && onSwipeLeft) {
          onSwipeLeft()
        } else if (diff < 0 && onSwipeRight) {
          onSwipeRight()
        }
      }

      setStartX(null)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-elite-card border border-elite-border rounded-xl p-4 shadow-elite backdrop-blur-sm touch-manipulation transition-transform duration-200 active:scale-98',
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MobileSwipeCard.displayName = "MobileSwipeCard"

// Safe area para mobile (considerando notch, etc)
interface MobileSafeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  top?: boolean
  bottom?: boolean
}

export const MobileSafeArea = React.forwardRef<HTMLDivElement, MobileSafeAreaProps>(
  ({ className, top = true, bottom = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          top && 'pt-safe-top',
          bottom && 'pb-safe-bottom',
          className
        )}
        style={{
          paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
          paddingBottom: bottom ? 'env(safe-area-inset-bottom)' : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MobileSafeArea.displayName = "MobileSafeArea" 