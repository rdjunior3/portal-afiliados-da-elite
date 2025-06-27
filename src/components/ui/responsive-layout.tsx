import * as React from "react"
import { cn } from "@/lib/utils"

// Container responsivo Elite
interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
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

// Grid responsivo Elite
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

export const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols = { default: 1, sm: 2, lg: 3 }, gap = 'md', children, ...props }, ref) => {
    const gridCols: Record<number, string> = {
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

// Stack para organização vertical
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = 'md', align = 'stretch', children, ...props }, ref) => {
    const spacingClasses = {
      xs: 'space-y-1',
      sm: 'space-y-2',
      md: 'space-y-4', 
      lg: 'space-y-6',
      xl: 'space-y-8'
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
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

// Flex responsivo
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  wrap?: boolean
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    className, 
    direction = 'row', 
    wrap = false, 
    gap = 'md',
    align = 'center',
    justify = 'start',
    children, 
    ...props 
  }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse'
    }

    const gapClasses = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    }

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          wrap && 'flex-wrap',
          gapClasses[gap],
          alignClasses[align],
          justifyClasses[justify],
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
ResponsiveGrid.displayName = "ResponsiveGrid"
Stack.displayName = "Stack"
Flex.displayName = "Flex" 