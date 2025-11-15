'use client'

import { useGLTF, OrbitControls, useTexture, Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated, to } from '@react-spring/three'


export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
    </mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, hover] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  return (
    <group ref={mesh} {...props}>
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, 1]} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, -1]} />
      <mesh onClick={() => router.push(route)} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
      </mesh>
    </group>
  )
}

export const ZoomControls = ({ disabled = false, defaultDistance = 6 }) => {
  const { camera } = useThree()

  useEffect(() => {
    if (camera) {
      // Check if it's a mobile device based on screen width
      const isMobile = window.innerWidth <= 768
      const distance = isMobile ? Math.max(defaultDistance + 3, 10) : defaultDistance
      camera.position.setZ(distance)
    }
  }, [camera, defaultDistance])

  return (
    <OrbitControls
      enabled={!disabled}
      enableRotate={false}
      enablePan={false}
      enableZoom={!disabled}
      zoomSpeed={1}
      minDistance={4}
      maxDistance={15}
    />
  )
}



export const Rectangle = ({ imagePath='/The_Wiggsters.jpg', onDoorContentClick, selectedDoor, doorPosition, currentDay, username, initiallyOpenDoors = [0], ...props }) => {
  const groupRef = useRef(null)
  const { camera, mouse } = useThree()
  const [openedDoors, setOpenedDoors] = useState(new Set())
  const [hasLoaded, setHasLoaded] = useState(false)

  const texture = useTexture(imagePath)

  // Combined animation for load and zoom
  const { loadScale, position, zoomScale } = useSpring({
    loadScale: hasLoaded ? 1 : 0.001,
    position: selectedDoor && doorPosition
      ? [-doorPosition[0] * 5, -doorPosition[1] * 5, 0]
      : [0, 0, 0],
    zoomScale: selectedDoor ? 5 : 1,
    config: { tension: 170, friction: 26 }
  })

  // Trigger load animation when data is ready
  useEffect(() => {
    if (currentDay !== null && username) {
      setHasLoaded(true)
    }
  }, [currentDay, username])

  useFrame((state) => {
    // Only handle rotation
    if (groupRef.current && !selectedDoor) {
      const targetRotationY = mouse.x * -0.4
      const targetRotationX = mouse.y * 0.3

      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1
    }

    // Lock rotation when zoomed
    if (selectedDoor && groupRef.current) {
      groupRef.current.rotation.y = 0
      groupRef.current.rotation.x = 0
    }
  })

  const handleDoorOpen = async (username, doorNumber) => {
    if (selectedDoor) return
    setOpenedDoors(prev => new Set(prev).add(doorNumber))
    console.log(`Door ${doorNumber} opened!`)

    // Send door number to API
    try {
      const response = await fetch('/api/dooropen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, doorNumber}),
      })

      console.log(response)
      const data = await response.json()

      if (data.success) {
        console.log('Door number sent successfully:', data.data)
      } else {
        console.error('Failed to send door number:', data.error)
      }
    } catch (error) {
      console.error('Error sending door number:', error)
    }
  }

  const doors = Array.from({ length: 24 }, (_, i) => {
    const row = Math.floor(i / 6)
    const col = i % 6
    const x = (col - 2.5) * 0.35
    const y = (1.5 - row) * 0.7
    const position = [x, y, 0.135]
    const doorNumber = i + 1

    // Define content for all 24 doors
    const doorContents = {
      1: { doorNumber: 1, type: 'image', src: '/door-content/snoooowman.png', outsideImage: '/door-outside-images/door-1.jpg' },
      2: { doorNumber: 5, type: 'image', src: '/door-content/atand.png', outsideImage: '/door-outside-images/door-2.jpg' },
      3: { doorNumber: 10, type: 'image', src: '/door-content/piickles.png', outsideImage: '/door-outside-images/door-3.png' },
      4: { doorNumber: 19, type: 'video', src: '/door-content/dummy-video.mp4', outsideImage: '/door-outside-images/door-4.png' },
      5: { doorNumber: 8, type: 'image', src: '/door-content/ff14-summ-ish.png', outsideImage: '/door-outside-images/door-5.png' },
      6: { doorNumber: 2, type: 'image', src: '/door-content/dancing_with_the_wiggsters.png', outsideImage: '/door-outside-images/door-6.png' },
      7: { doorNumber: 17, type: 'image', src: '/door-content/after_christmas.PNG', outsideImage: '/door-outside-images/door-7.png' },
      8: { doorNumber: 6, type: 'image', src: '/door-content/nogenshot.jpg', outsideImage: '/door-outside-images/door-8.png' },
      9: { doorNumber: 11, type: 'image', src: '/door-content/noge_origin.png', outsideImage: '/door-outside-images/door-9.png' },
      10: { doorNumber: 3, type: 'image', src: '/door-content/nogeloix.png', outsideImage: '/door-outside-images/door-10.png' },
      11: { doorNumber: 21, type: 'image', src: '/door-content/dummy-image.png', outsideImage: '/door-outside-images/door-11.png' },
      12: { doorNumber: 7, type: 'image', src: '/door-content/christmas.png', outsideImage: '/door-outside-images/door-12.png' },
      13: { doorNumber: 4, type: 'image', src: '/door-content/sere_nyl_sakman.PNG', outsideImage: '/door-outside-images/door-13.png' },
      14: { doorNumber: 13, type: 'video', src: '/door-content/ror2_stuff.mp4', outsideImage: '/door-outside-images/door-14.png' },
      15: { doorNumber: 24, type: 'image', src: '/door-content/dummy-image.png', outsideImage: '/door-outside-images/door-15.png' },
      16: { doorNumber: 12, type: 'image', src: '/door-content/doggo.jpg', outsideImage: '/door-outside-images/door-16.png' },
      17: { doorNumber: 15, type: 'image', src: '/door-content/snoowmannnnn.png', outsideImage: '/door-outside-images/door-17.png' },
      18: { doorNumber: 23, type: 'image', src: '/door-content/snoowman.png', outsideImage: '/door-outside-images/door-18.png' },
      19: { doorNumber: 18, type: 'image', src: '/door-content/wiggy2.jpg', outsideImage: '/door-outside-images/door-19.png' },
      20: { doorNumber: 14, type: 'image', src: '/door-content/noggya.png', outsideImage: '/door-outside-images/door-20.png' },
      21: { doorNumber: 22, type: 'image', src: '/door-content/dummy-image.png', outsideImage: '/door-outside-images/door-21.png' },
      22: { doorNumber: 16, type: 'image', src: '/door-content/nyl_stare.PNG', outsideImage: '/door-outside-images/door-22.png' },
      23: { doorNumber: 9, type: 'image', src: '/door-content/nyl_pool_party.PNG', outsideImage: '/door-outside-images/door-23.png' },
      24: { doorNumber: 20, type: 'video', src: '/door-content/dummy-video.mp4', outsideImage: '/door-outside-images/door-24.png' }
    }

    const shouldBeOpen = initiallyOpenDoors.includes(doorNumber)
    const doorContent = doorContents[i + 1]
    const isLocked = currentDay !== null && doorContent.doorNumber > currentDay

    return (
      <Door
        key={doorNumber}
        position={position}
        doorNumber={doorNumber}
        username={username}
        content={doorContent}
        outsideImage={doorContent?.outsideImage}
        onOpen={handleDoorOpen}
        onContentClick={() => onDoorContentClick(doorContent.doorNumber, position, doorContent)}
        isZoomed={selectedDoor === doorNumber}
        isDisabled={selectedDoor && selectedDoor !== doorNumber}
        isLocked={isLocked}
        currentDay={currentDay}
        initialOpen={shouldBeOpen}
      />
    )
  })

  return (
    <animated.group
      ref={groupRef}
      scale={to([loadScale, zoomScale], (load, zoom) => load * zoom)}
      position={position}
      {...props}
    >
      <mesh>
        <boxGeometry args={[2.2, 2.8, 0.3]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {hasLoaded && doors}
    </animated.group>
  )
}


export const Door = ({ position,username, doorNumber, content, outsideImage, onOpen, onContentClick, isZoomed, isDisabled, isLocked, initialOpen = false, ...props }) => {
  const doorRef = useRef()
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [hovered, setHovered] = useState(false)
  const [texture, setTexture] = useState(null)
  const videoRef = useRef()

  // Use useTexture hook for outside image - this is more reliable in R3F
  // Always call the hook, but pass null if no image
  const outsideTexture = useTexture(outsideImage || '/door-images/dummy-image.png')
  const hasOutsideImage = !!outsideImage

  const { rotation } = useSpring({
    rotation: isOpen ? [0, Math.PI / 2, 0] : [0, 0, 0],
    config: {
      tension: 200,
      friction: 25
    }
  })

  // Load content when door opens
  useEffect(() => {
    if (isOpen && content) {
      if (content.type === 'image') {
        const loader = new THREE.TextureLoader()
        loader.load(content.src, (loadedTexture) => {
          loadedTexture.needsUpdate = true
          setTexture(loadedTexture)
        })
      } else if (content.type === 'video') {
        const video = document.createElement('video')
        video.src = content.src
        video.crossOrigin = 'anonymous'
        video.loop = true
        video.muted = true
        video.playsInline = true

        const videoTexture = new THREE.VideoTexture(video)
        videoTexture.minFilter = THREE.LinearFilter
        videoTexture.magFilter = THREE.LinearFilter
        videoTexture.needsUpdate = true

        setTexture(videoTexture)
        videoRef.current = video

        if (isZoomed) {
          video.play()
        }
      }
    }
  }, [isOpen, content, isZoomed])

  // Control video playback
  useEffect(() => {
    if (videoRef.current) {
      if (isZoomed) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isZoomed])

  const handleDoorClick = (e) => {
    e.stopPropagation()
    if (!isOpen && !isDisabled && !isLocked) {
      setIsOpen(true)
      onOpen?.(username, doorNumber)
    }
  }

  const handleContentClick = (e) => {
    e.stopPropagation()
    if (isOpen && !isZoomed) {
      onContentClick?.(doorNumber)
    }
  }

  return (
    <group position={position} {...props}>
      <animated.group
        ref={doorRef}
        position={[0.16, 0, 0.01]}
        rotation={rotation}
      >
        {/* Door with texture on front face only */}
        {hasOutsideImage ? (
          <>
            {/* Main door box with all solid color sides */}
            <mesh position={[-0.15, 0, 0]} onClick={handleDoorClick} onPointerOver={() => !isDisabled && setHovered(true)} onPointerOut={() => setHovered(false)}>
              <boxGeometry args={[0.35, 0.43, 0.015]} />
              <meshStandardMaterial color={isOpen ? "#654321" : hovered ? "#E2722E" : "#D2691E"} roughness={0.8} />
            </mesh>
            {/* Front face with texture as overlay */}
            <mesh position={[-0.15, 0, 0.008]} onClick={handleDoorClick} onPointerOver={() => !isDisabled && setHovered(true)} onPointerOut={() => setHovered(false)}>
              <planeGeometry args={[0.35, 0.43]} />
              <meshStandardMaterial
                map={outsideTexture}
                roughness={hovered ? 0.5 : 0.8}
                emissive={isOpen ? "#000000" : hovered ? "#e8fdff" : "#000000"}
                emissiveIntensity={hovered ? 0.2 : 0}
              />
            </mesh>
          </>
        ) : (
          <mesh position={[-0.15, 0, 0]} onClick={handleDoorClick} onPointerOver={() => !isDisabled && setHovered(true)} onPointerOut={() => setHovered(false)}>
            <boxGeometry args={[0.35, 0.43, 0.015]} />
            <meshStandardMaterial color={isOpen ? "#654321" : hovered ? "#E2722E" : "#D2691E"} roughness={0.8} />
          </mesh>
        )}
      </animated.group>

      {/* Content behind door */}
      {isOpen && (
        <mesh
          key={texture ? 'loaded' : 'loading'}
          position={[0, 0, 0.01]}
          onClick={handleContentClick}
          onPointerOver={() => !isZoomed && setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[0.28, 0.4, 0.015]} />
          <meshStandardMaterial
            map={texture}
            color={texture ? "white" : (isZoomed ? "#FF4444" : hovered ? "#FF8888" : "#FF6B6B")}
          />
        </mesh>
      )}
    </group>
  )
}
