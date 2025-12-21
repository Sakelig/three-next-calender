'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'
import { ZoomControls } from '@/components/canvas/Examples'
import { useSpring, animated } from '@react-spring/web'

const Rectangle = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Rectangle), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function CalendarPage() {
  const [selectedDoor, setSelectedDoor] = useState(null)
  const [doorPosition, setDoorPosition] = useState(null)
  const [doorContent, setDoorContent] = useState(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [currentDay, setCurrentDay] = useState(null)
  const [username, setUsername] = useState(null)
  const [doorsOpened, setDoorsOpened] = useState([0])

  const dayAnimation = useSpring({
    from: { transform: 'translateY(-50px)', opacity: 0 },
    to: {
      transform: currentDay !== null ? 'translateY(0px)' : 'translateY(-50px)',
      opacity: currentDay !== null ? 1 : 0
    },
    config: { tension: 80, friction: 20 }
  })


  // Initialize username from localStorage or generate new one
  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    const newUsername = generateUsername()
    if (storedUsername) {
      setUsername(storedUsername)
    } else {
      localStorage.setItem('username', newUsername)
      setUsername(newUsername)
    }
    const fetchCurrentDay = async () => {
      try {
        const response = await fetch('/api/userstate',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({username: storedUsername ? storedUsername : newUsername}),
        })
        const data = await response.json()
        // TODO DELETE THIS - just for testing days
        setCurrentDay(data.data.day || 0)
        // setCurrentDay(3)
        setDoorsOpened(data.data.numbers)
      } catch (error) {
        console.error('Failed to fetch current day:', error)
        // setCurrentDay(2)
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
    if (selectedDoor && (doorContent?.type === 'video' || doorContent?.type === 'youtube')) {
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

  // Use direct DOM manipulation for background animation to avoid re-renders
  useEffect(() => {
    const background = document.getElementById('parallax-background')
    if (!background) return

    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event) => {
      targetX = (event.clientX - window.innerWidth / 2) * 0.005
      targetY = (event.clientY - window.innerHeight / 2) * 0.005
    }

    const animate = () => {
      currentX += (targetX - currentX) * 0.1
      currentY += (targetY - currentY) * 0.1

      background.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.1)`

      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Memoize video player to prevent flickering
  const videoPlayer = useMemo(() => {
    if (!showVideoPlayer || !doorContent || (doorContent.type !== 'video' && doorContent.type !== 'youtube')) {
      return null
    }

    const isYouTube = doorContent.type === 'youtube'

    // Extract YouTube video ID if it's a YouTube link
    let embedUrl = doorContent.src
    if (isYouTube) {
      const getYouTubeVideoId = (url) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[7].length === 11) ? match[7] : null
      }
      const videoId = getYouTubeVideoId(doorContent.src)
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : doorContent.src
    }

    return (
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
        {isYouTube ? (
          <iframe
            width="100%"
            height="450"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              borderRadius: '5px',
              maxHeight: '70vh'
            }}
          />
        ) : (
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
        )}
      </div>
    )
  }, [showVideoPlayer, doorContent])

  return (
    <>
      {/* Animated blurry background */}
      <div
        id="parallax-background"
        style={{
          position: 'fixed',
          top: '-5%',
          left: '-5%',
          width: '110%',
          height: '110%',
          backgroundImage: 'url(/cozy-winter.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          zIndex: -1,
          transform: 'scale(1.1)',
          transition: 'transform 0.1s ease-out'
        }}
      />

      <div className='mx-auto flex w-full flex-col flex-wrap items-center px-4 md:flex-row md:px-0 lg:w-4/5'>
        <div className='flex w-full flex-col items-start justify-center p-4 text-center sm:p-6 md:w-2/5 md:p-12 md:text-left'>
          <animated.p
            style={dayAnimation}
            className='w-full text-2xl uppercase sm:text-2xl md:text-2xl'
          >
            Day {currentDay !== null ? currentDay : '...'}
          </animated.p>
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

      {videoPlayer}

      <View orbit className='absolute top-0 flex h-screen w-full flex-col items-center justify-center'>
        <Rectangle
          onDoorContentClick={handleDoorContentClick}
          selectedDoor={selectedDoor}
          doorPosition={doorPosition}
          currentDay={currentDay}
          username={username}
          initiallyOpenDoors={doorsOpened}
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

// Helper function to generate a random username
const generateUsername = () => {
  const adjectives = ['Happy', 'Jolly', 'Merry', 'Festive', 'Cheerful', 'Bright', 'Snowy', 'Cozy']
  const nouns = ['Penguin', 'Snowman', 'Reindeer', 'Elf', 'Star', 'Snowflake', 'Bear', 'Fox']
  const randomNum = Math.floor(Math.random() * 1000)
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${randomAdj}${randomNoun}${randomNum}`
}
