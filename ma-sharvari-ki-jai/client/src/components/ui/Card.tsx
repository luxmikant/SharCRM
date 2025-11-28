import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm',
        glass: 'bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg',
        gradient: 'bg-gradient-to-br from-brand-500/10 to-yellow-500/10 border border-brand-200/50',
        elevated: 'bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50',
        interactive: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-200 cursor-pointer',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'none',
    },
  }
)

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'>, VariantProps<typeof cardVariants> {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', variant, padding, hover = false, ...props }: CardProps) {
  return (
    <motion.div
      className={cardVariants({ variant, padding, className })}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -4,
        boxShadow: '0 20px 40px rgba(163,230,53,0.15)'
      } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ title, description, actions, className = '' }: { 
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between ${className}`}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl ${className}`}>
      {children}
    </div>
  )
}

export default Card

// Alias to align with alternate import style
export const CardContent = CardBody
