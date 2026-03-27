"use client"

import Image from "next/image"

export default function FormationPage() {
  return (
    <div className="min-h-screen">
      <section className="relative mx-4 mt-4 h-[320px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[420px] lg:mx-8 lg:h-[520px]">
        <Image src="/formation/formation1.jpg" alt="Formation" fill className="object-cover hero-zoom" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-10 px-10 sm:pb-14 sm:px-20 lg:pb-16 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-4 py-2 font-serif text-4xl font-bold leading-none text-white sm:text-6xl lg:text-7xl">
            formation
          </h1>
        </div>
      </section>

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

