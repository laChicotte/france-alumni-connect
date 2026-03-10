"use client"

import { useEffect, useRef, useState } from "react"

export default function FormationPage() {
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const maxTravel = window.innerWidth >= 640 ? 550 : 300
      const translateY = -Math.min(y, maxTravel)

      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${translateY}px)`
      }

    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen">
      <section ref={heroRef} className="fixed left-0 top-20 z-10 h-[300px] w-full overflow-hidden will-change-transform sm:h-[550px]">
        <img src="/formation/formation.jpg" alt="Formation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
            formation
          </h1>
        </div>
      </section>

      <div className="h-[380px] sm:h-[630px]" />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-[#3558A2] sm:text-4xl">
            À venir dans les prochaines mises à jour
          </h2>
        </div>
      </section>
    </div>
  )
}

