import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  iconOnly?: boolean
}

export function Logo({ size = 'md', showText = true, className = '', iconOnly = false }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 36, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 56, text: 'text-3xl', gap: 'gap-4' },
  }
  
  const { icon, text, gap } = sizes[size]
  
  return (
    <motion.div 
      className={`flex items-center ${gap} ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      {/* Logo Icon */}
      <motion.div
        className="relative flex-shrink-0"
        style={{ width: icon, height: icon }}
        whileHover={{ rotate: 5 }}
      >
        <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Rounded square background */}
          <rect 
            x="2" 
            y="2" 
            width="46" 
            height="46" 
            rx="10" 
            className="stroke-current" 
            strokeWidth="2.5"
            fill="none"
          />
          {/* Eye/lens shape */}
          <path 
            d="M2 25 Q25 6 48 25 Q25 44 2 25" 
            className="stroke-current" 
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
      
      {/* Logo Text */}
      {showText && !iconOnly && (
        <span className={`font-bold ${text} tracking-tight`}>
          SHARCRM
        </span>
      )}
    </motion.div>
  )
}

// Filled version for dark backgrounds
export function LogoFilled({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 36, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 56, text: 'text-3xl', gap: 'gap-4' },
  }
  
  const { icon, text, gap } = sizes[size]
  
  return (
    <motion.div 
      className={`flex items-center ${gap} ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      {/* Logo Icon with lime background */}
      <motion.div
        className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-lg shadow-brand-300/30"
        style={{ width: icon, height: icon }}
        whileHover={{ rotate: 5 }}
      >
        <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Lime background */}
          <rect width="50" height="50" rx="10" fill="#CCFF00"/>
          {/* Black strokes */}
          <rect 
            x="5" 
            y="5" 
            width="40" 
            height="40" 
            rx="8" 
            stroke="#000" 
            strokeWidth="2.5"
            fill="none"
          />
          <path 
            d="M5 25 Q25 8 45 25 Q25 42 5 25" 
            stroke="#000" 
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold ${text} tracking-tight`}>
          SHARCRM
        </span>
      )}
    </motion.div>
  )
}

export default Logo
