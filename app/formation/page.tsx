"use client"

import Image from "next/image"

export default function FormationPage() {
  return (
    <div className="min-h-screen">
      <section className="relative mx-4 mt-4 h-[320px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[420px] lg:mx-8 lg:h-[400px]">
        <Image src="/formation/formation1.jpg" alt="Formation" fill className="object-cover hero-zoom" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-10 px-10 sm:pb-14 sm:px-20 lg:pb-16 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl lg:text-4xl">
            formation
          </h1>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl">
          Cette page est en cours de développement. Bientôt, vous, alumni, pourrez y proposer vos formations (pour les alumni ou le grand public) et découvrir celles auxquelles vous inscrire. 
          </h2>
        </div>
      </section>
    </div>
  )
}

