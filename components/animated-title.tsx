"use client"

import { useState, useEffect, useRef } from "react"

export function AnimatedTitle() {
  const words = ["CONNECTER", "VALORISER", "IMPACTER"]
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const typingSpeedRef = useRef(100)

  useEffect(() => {
    const currentWord = words[currentWordIndex]
    
    if (!isDeleting) {
      // Ajouter des lettres
      if (displayedText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1))
        }, typingSpeedRef.current)
        return () => clearTimeout(timeout)
      } else {
        // Attendre avant de commencer à supprimer
        const timeout = setTimeout(() => {
          setIsDeleting(true)
          typingSpeedRef.current = 50 // Plus rapide pour la suppression
        }, 2000) // Pause de 2 secondes quand le mot est complet
        return () => clearTimeout(timeout)
      }
    } else {
      // Supprimer des lettres
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, typingSpeedRef.current)
        return () => clearTimeout(timeout)
      } else {
        // Passer au mot suivant
        setIsDeleting(false)
        typingSpeedRef.current = 100 // Vitesse normale pour la frappe
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
      }
    }
  }, [displayedText, isDeleting, currentWordIndex, words])

  return (
    <span className="inline-block">
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

