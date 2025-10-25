'use client'

import { useGLTF, OrbitControls, useTexture, Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/three'


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

export function Duck(props) {
  const { scene } = useGLTF('/duck.glb')

  useFrame((state, delta) => (scene.rotation.y += delta))

  return <primitive object={scene} {...props} />
}
export function Dog(props) {
  const { scene } = useGLTF('/dog.glb')

  return <primitive object={scene} {...props} />
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



export const Rectangle = ({ imagePath='/The_Wiggsters.jpg', onDoorContentClick, selectedDoor, doorPosition, ...props }) => {
  const groupRef = useRef(null)
  const { camera, mouse } = useThree()
  const [openedDoors, setOpenedDoors] = useState(new Set())
  const [targetGroupPosition, setTargetGroupPosition] = useState(null)
  const [targetGroupScale, setTargetGroupScale] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const texture = useTexture(imagePath)

  useEffect(() => {
    if (selectedDoor && doorPosition) {
      setIsAnimating(true)
      const scaleFactor = 5

      // More accurate centering - use the exact door position without multipliers
      setTargetGroupPosition([
        -doorPosition[0] * scaleFactor,
        -doorPosition[1] * scaleFactor,
        0
      ])
      setTargetGroupScale(scaleFactor)
    } else if (selectedDoor === null) {
      setIsAnimating(true)
      setTargetGroupPosition([0, 0, 0])
      setTargetGroupScale(1)
    }
  }, [selectedDoor, doorPosition])

  useFrame((state, delta) => {
    // Group animation only
    if (targetGroupPosition && targetGroupScale !== null && isAnimating) {
      const lerpFactor = 0.08

      if (groupRef.current) {
        // Animate group position and scale
        groupRef.current.position.x += (targetGroupPosition[0] - groupRef.current.position.x) * lerpFactor
        groupRef.current.position.y += (targetGroupPosition[1] - groupRef.current.position.y) * lerpFactor
        groupRef.current.position.z += (targetGroupPosition[2] - groupRef.current.position.z) * lerpFactor

        groupRef.current.scale.x += (targetGroupScale - groupRef.current.scale.x) * lerpFactor
        groupRef.current.scale.y += (targetGroupScale - groupRef.current.scale.y) * lerpFactor
        groupRef.current.scale.z += (targetGroupScale - groupRef.current.scale.z) * lerpFactor
      }

      const groupDistance = groupRef.current ? Math.sqrt(
        Math.pow(targetGroupPosition[0] - groupRef.current.position.x, 2) +
        Math.pow(targetGroupPosition[1] - groupRef.current.position.y, 2)
      ) + Math.abs(targetGroupScale - groupRef.current.scale.x) : 0

      if (groupDistance < 0.1) {
        setIsAnimating(false)
      }
    }

    // Handle group rotation smoothly
    if (groupRef.current && !selectedDoor && !isAnimating) {
      const targetRotationY = mouse.x * -0.3
      const targetRotationX = mouse.y * 0.2

      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1
    }

    // Lock rotation when zoomed in
    if (selectedDoor && groupRef.current) {
      groupRef.current.rotation.y = 0
      groupRef.current.rotation.x = 0
    }
  })

  const handleDoorOpen = (doorNumber) => {
    if (selectedDoor) return
    setOpenedDoors(prev => new Set(prev).add(doorNumber))
    console.log(`Door ${doorNumber} opened!`)
  }

  const doors = Array.from({ length: 24 }, (_, i) => {
    const row = Math.floor(i / 6)
    const col = i % 6
    const x = (col - 2.5) * 0.35
    const randomOffset = (Math.sin(i * 12.962) * 0.5 + Math.cos(i * 1.789) * 0.3) * 0.1
    // const y = (1.5 - row) * 0.7 + randomOffset
    const y = (1.5 - row) * 0.7
    const position = [x, y, 0.16]

    // Define content for all 24 doors
    const doorContents = {
      1: { type: 'image', src: '/door-images/dummy-image.png', outsideImage: '/The_Wiggsters.jpg' },
      2: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      3: { type: 'image', src: '/door-images/dummy-image.png' },
      4: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      5: { type: 'image', src: '/door-images/dummy-image.png' },
      6: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      7: { type: 'image', src: '/door-images/dummy-image.png' },
      8: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      9: { type: 'image', src: '/door-images/dummy-image.png' },
      10: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      11: { type: 'image', src: '/door-images/dummy-image.png' },
      12: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      13: { type: 'image', src: '/door-images/dummy-image.png' },
      14: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      15: { type: 'image', src: '/door-images/dummy-image.png' },
      16: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      17: { type: 'image', src: '/door-images/dummy-image.png' },
      18: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      19: { type: 'image', src: '/door-images/dummy-image.png' },
      20: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      21: { type: 'image', src: '/door-images/dummy-image.png' },
      22: { type: 'video', src: '/door-videos/dummy-video.mp4' },
      23: { type: 'image', src: '/door-images/dummy-image.png' },
      24: { type: 'video', src: '/door-videos/dummy-video.mp4' }
    }

    const doorContent = doorContents[i + 1]

    return (
      <Door
        key={i + 1}
        position={position}
        doorNumber={i + 1}
        content={doorContent}
        outsideImage={doorContent?.outsideImage}
        onOpen={handleDoorOpen}
        onContentClick={(doorNumber) => onDoorContentClick?.(doorNumber, position, doorContent)}
        isZoomed={selectedDoor === i + 1}
        isDisabled={selectedDoor && selectedDoor !== i + 1}
      />
    )
  })

  return (
    <group ref={groupRef} {...props}>
      <mesh>
        <boxGeometry args={[2.2, 2.8, 0.3]} />
        <meshStandardMaterial
          map={texture}
        />
      </mesh>
      {doors}
    </group>
  )
}


export const Door = ({ position, doorNumber, content, outsideImage, onOpen, onContentClick, isZoomed, isDisabled, ...props }) => {
  const doorRef = useRef()
  const [isOpen, setIsOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [texture, setTexture] = useState(null)
  const videoRef = useRef()

  // Use useTexture hook for outside image - this is more reliable in R3F
  const outsideTexture = outsideImage ? useTexture(outsideImage) : null

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
    if (!isOpen && !isDisabled) {
      setIsOpen(true)
      onOpen?.(doorNumber)
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
        <mesh
          position={[-0.15, 0, 0]}
          onClick={handleDoorClick}
          onPointerOver={() => !isDisabled && setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[0.35, 0.43, 0.015]} />
          {outsideTexture ? (
            <meshStandardMaterial
              map={outsideTexture}
              roughness={0.8}
            />
          ) : (
            <meshStandardMaterial
              color={isOpen ? "#654321" : hovered ? "#E2722E" : "#D2691E"}
              roughness={0.8}
            />
          )}

          {!outsideTexture && (
            <mesh position={[0, 0, 0.008]}>
              <boxGeometry args={[0.08, 0.08, 0.002]} />
              <meshStandardMaterial color="white" />
            </mesh>
          )}
        </mesh>
      </animated.group>

      {/* Content behind door */}
      {isOpen && (
        <mesh
          position={[0, 0, -0.01]}
          onClick={handleContentClick}
          onPointerOver={() => !isZoomed && setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[0.28, 0.4, 0.01]} />
          <meshStandardMaterial
            map={texture}
            color={texture ? "white" : (isZoomed ? "#FF4444" : hovered ? "#FF8888" : "#FF6B6B")}
          />
        </mesh>
      )}
    </group>
  )
}
