'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ZoomControls } from '@/components/canvas/Examples'

const Rectangle = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Rectangle), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function CalendarPage() {
  const [selectedDoor, setSelectedDoor] = useState(null)

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
        <Rectangle onDoorContentClick={setSelectedDoor} />
        <ZoomControls />
        <Common />
      </View>

      {/* Modal outside Canvas */}
      {selectedDoor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '80vw',
            height: '80vh',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
            overflow: 'auto'
          }}>
            <button
              onClick={() => setSelectedDoor(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            <h2>Day {selectedDoor}</h2>
            <p>Anniversary content for day {selectedDoor}!</p>
            <p>Add your special memories, photos, or messages here.</p>
          </div>
        </div>
      )}
    </>
  )
}
