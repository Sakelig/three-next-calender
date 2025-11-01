'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { ZoomControls } from '@/components/canvas/Examples'

const Rectangle = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Rectangle), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function CalendarPage() {
  const [selectedDoor, setSelectedDoor] = useState(null)
  const [doorPosition, setDoorPosition] = useState(null)
  const [doorContent, setDoorContent] = useState(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [currentDay, setCurrentDay] = useState(null)

  // Fetch current day from API
  useEffect(() => {
    const fetchCurrentDay = async () => {
      try {
        const response = await fetch('/api/day')
        const data = await response.json()
        // TODO DELETE THIS - just for testing days
        // setCurrentDay(data.dayData?.day || 0)
        setCurrentDay(3)
      } catch (error) {
        console.error('Failed to fetch current day:', error)
        setCurrentDay(0)
      }
    }

    fetchCurrentDay()
  }, [])

  const handleDoorContentClick = (doorNumber, position, content) => {
    // Check if door is unlocked
    if (currentDay !== null && doorNumber > currentDay) {
      console.log(`Door ${doorNumber} is locked. Current day is ${currentDay}`)
      return
    }

    setSelectedDoor(doorNumber)
    setDoorPosition(position)
    setDoorContent(content)
    setShowVideoPlayer(false)
  }

  const handleBackClick = () => {
    setSelectedDoor(null)
    setDoorPosition(null)
    setDoorContent(null)
    setShowVideoPlayer(false)
  }

  useEffect(() => {
    if (selectedDoor && doorContent?.type === 'video') {
      const timer = setTimeout(() => {
        setShowVideoPlayer(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [selectedDoor, doorContent])

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && selectedDoor) {
        handleBackClick()
      }
    }

    window.addEventListener('keydown', handleEscapeKey)

    return () => {
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [selectedDoor])

  return (
    <>
      <div className='mx-auto flex w-full flex-col flex-wrap items-center px-4 md:flex-row md:px-0 lg:w-4/5'>
        <div className='flex w-full flex-col items-start justify-center p-4 text-center sm:p-6 md:w-2/5 md:p-12 md:text-left'>
          <p className='w-full text-xs uppercase sm:text-sm md:text-base'>
            Day {currentDay !== null ? currentDay : '...'}
          </p>
          <h1 className='my-2 text-xl font-bold leading-tight sm:text-2xl md:my-4 md:text-5xl'>Wiggsters Anniversary Calendar</h1>
        </div>
      </div>

      {selectedDoor && (
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000 }}>
          <button
            onClick={handleBackClick}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1fb2f5',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Back
          </button>
        </div>
      )}

      {showVideoPlayer && doorContent?.type === 'video' && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          width: '80vw',
          maxWidth: '800px',
          backgroundColor: 'rgba(0,0,0,0.9)',
          padding: '20px',
          borderRadius: '10px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <video
            src={doorContent.src}
            controls
            autoPlay
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '70vh'
            }}
          />
        </div>
      )}

      <View orbit className='absolute top-0 flex h-screen w-full flex-col items-center justify-center'>
        <Rectangle
          onDoorContentClick={handleDoorContentClick}
          selectedDoor={selectedDoor}
          doorPosition={doorPosition}
          currentDay={currentDay}
        />
        <ZoomControls disabled={!!selectedDoor} defaultDistance={8} />
        <Common />
      </View>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
