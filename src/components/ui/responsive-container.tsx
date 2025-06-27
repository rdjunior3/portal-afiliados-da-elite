import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ className, maxWidth = 'xl', padding = 'md', children, ...props }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl', 
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      '2xl': 'max-w-full',
      full: 'max-w-full'
    }

    const paddingClasses = {
      none: '',
      sm: 'px-2 sm:px-4',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveContainer.displayName = "ResponsiveContainer"

// Component para layouts de grid responsivos
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols = { default: 1, sm: 2, lg: 3 }, gap = 'md', children, ...props }, ref) => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-2', 
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6'
    }

    const gridGaps = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-4 sm:gap-6',
      lg: 'gap-6 sm:gap-8',
      xl: 'gap-8 sm:gap-10'
    }

    const colClasses = [
      cols.default && gridCols[cols.default],
      cols.sm && `sm:${gridCols[cols.sm]}`,
      cols.md && `md:${gridCols[cols.md]}`,
      cols.lg && `lg:${gridCols[cols.lg]}`,
      cols.xl && `xl:${gridCols[cols.xl]}`
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colClasses,
          gridGaps[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = "ResponsiveGrid"

// Component para textos responsivos
interface ResponsiveTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  responsive?: boolean
}

const ResponsiveText = React.forwardRef<HTMLElement, ResponsiveTextProps>(
  ({ className, as: Component = 'p', size = 'base', responsive = true, children, ...props }, ref) => {
    const sizeClasses = {
      xs: responsive ? 'text-xs sm:text-sm' : 'text-xs',
      sm: responsive ? 'text-sm sm:text-base' : 'text-sm',
      base: responsive ? 'text-base sm:text-lg' : 'text-base',
      lg: responsive ? 'text-lg sm:text-xl' : 'text-lg',
      xl: responsive ? 'text-xl sm:text-2xl' : 'text-xl',
      '2xl': responsive ? 'text-2xl sm:text-3xl' : 'text-2xl',
      '3xl': responsive ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-3xl',
      '4xl': responsive ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-4xl',
      '5xl': responsive ? 'text-5xl sm:text-6xl lg:text-7xl' : 'text-5xl',
      '6xl': responsive ? 'text-6xl sm:text-7xl lg:text-8xl' : 'text-6xl'
    }

    return (
      <Component
        ref={ref as any}
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

ResponsiveText.displayName = "ResponsiveText"

export { ResponsiveContainer, ResponsiveGrid, ResponsiveText } 