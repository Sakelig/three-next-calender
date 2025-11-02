'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/calender')
  }

  return (
    <div
      onClick={handleClick}
      className="flex min-h-screen cursor-pointer flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        touchAction: 'manipulation'
      }}
    >
      <div className='mx-auto flex w-full max-w-6xl flex-col items-center text-center lg:flex-row lg:text-left'>
        {/* Main intro section */}
        <div className='flex w-full flex-col items-center justify-center p-6 text-white sm:p-8 md:p-12 lg:w-3/5 lg:items-start'>
          <p className='mb-2 w-full text-sm uppercase opacity-80 sm:text-base lg:text-lg'>Welcome to</p>
          <h1 className='my-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl'>
            Wiggsters Anniversary Calendar
          </h1>
          <p className='mb-6 max-w-md text-base leading-normal opacity-90 sm:mb-8 sm:text-lg lg:max-w-none lg:text-xl'>
            Click anywhere to explore our special advent calendar
          </p>
        </div>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform px-4 text-white opacity-60 sm:bottom-8">
        <p className="text-center text-xs sm:text-sm">Tap anywhere to continue</p>
      </div>
    </div>
  )
}
