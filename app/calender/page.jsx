'use client'

import dynamic from 'next/dynamic'
import { ZoomControls } from '@/components/canvas/Examples'

const Rectangle = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Rectangle), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function CalendarPage() {
  return (
    <>
      <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-4/5'>
        <div className='flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left'>
          <p className='w-full uppercase'>Day 0</p>
          <h1 className='my-4 text-5xl font-bold leading-tight'>Wiggsters Anniversary Calendar</h1>
          <p className='text-gray-600'>Drag the doors to open them!</p>
        </div>
      </div>

      <View orbit className='absolute top-0 flex h-screen w-full flex-col items-center justify-center'>
        <Rectangle />
        <ZoomControls />
        <Common />
      </View>
    </>
  )
}
