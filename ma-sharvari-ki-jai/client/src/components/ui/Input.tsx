import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

const inputVariants = cva(
  'flex w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200',
        ghost: 'border-transparent bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200',
        filled: 'border-transparent bg-gray-100 focus:bg-gray-50 focus:border-violet-500 focus:ring-2 focus:ring-violet-200',
      },
      inputSize: {
        sm: 'h-9 text-xs px-3',
        md: 'h-10 text-sm px-4',
        lg: 'h-12 text-base px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
)

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  className?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  error?: boolean
}

export function Input({
  className = '',
  variant,
  inputSize,
  icon: Icon,
  iconPosition = 'left',
  error,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const iconPadding = Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''
  const baseInputClasses = `${inputVariants({ variant, inputSize })} ${iconPadding} ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
  } ${className}`

  return (
    <div className="relative">
      {Icon && (
        <div
          className={`absolute ${iconPosition === 'left' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none`}
        >
          <Icon className={`w-5 h-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
      )}
      <input
        className={baseInputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {/* Animated cursor with glow effect */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0, scaleY: 0.6, filter: 'blur(0px)' }}
        animate={
          isFocused
            ? { 
                opacity: [0.7, 1, 0.7], 
                scaleY: [0.8, 1.1, 0.8],
                filter: ['blur(0px)', 'blur(1px)', 'blur(0px)']
              }
            : { opacity: 0, scaleY: 0.6 }
        }
        transition={{ 
          duration: 1.2, 
          repeat: isFocused ? Infinity : 0, 
          repeatType: 'mirror',
          ease: 'easeInOut'
        }}
        className="pointer-events-none absolute right-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-400 via-yellow-300 to-brand-500 shadow-[0_0_8px_rgba(163,230,53,0.6)]"
      />
    </div>
  )
}

export default Input

const textareaVariants = cva(
  'flex w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200',
        ghost: 'border-transparent bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200',
        filled: 'border-transparent bg-gray-100 focus:bg-gray-50 focus:border-violet-500 focus:ring-2 focus:ring-violet-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  className?: string
  error?: boolean
}

export function Textarea({
  className = '',
  variant,
  error,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`${textareaVariants({ variant })} min-h-[100px] ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
      } ${className}`}
      {...props}
    />
  )
}

// Animated search input with clear button
interface SearchInputProps extends Omit<InputProps, 'icon'> {
  onClear?: () => void
  showClear?: boolean
}

export function SearchInput({
  onClear,
  showClear = true,
  value,
  className = '',
  ...props
}: SearchInputProps) {
  const hasValue = value && String(value).length > 0

  return (
    <div className="relative group">
      <motion.div
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ scale: hasValue ? 0.9 : 1 }}
      >
        <svg
          className="w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </motion.div>
      <input
        value={value}
        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none ${className}`}
        {...props}
      />
      {showClear && hasValue && (
        <motion.button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClear}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      )}
    </div>
  )
}