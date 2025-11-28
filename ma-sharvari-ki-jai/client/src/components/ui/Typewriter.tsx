import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TypewriterProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
  cursorClassName?: string
}

export function Typewriter({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = '',
  cursorClassName = 'bg-brand-500'
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = words[currentWordIndex]
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < word.length) {
          setCurrentText(word.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <span className={className}>
      {currentText}
      <motion.span
        className={`inline-block w-1 h-[1.1em] ml-1 align-middle rounded-sm ${cursorClassName} shadow-[0_0_12px_rgba(163,230,53,0.8)]`}
        animate={{ 
          opacity: [1, 0.4, 1],
          scaleY: [1, 0.9, 1],
          boxShadow: [
            '0 0 8px rgba(163,230,53,0.6)',
            '0 0 16px rgba(250,204,21,0.8)',
            '0 0 8px rgba(163,230,53,0.6)'
          ]
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity, 
          repeatType: 'mirror',
          ease: 'easeInOut'
        }}
      />
    </span>
  )
}

export default Typewriter
