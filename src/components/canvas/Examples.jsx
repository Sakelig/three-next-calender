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

export const ZoomControls = () => {
  return (
    <OrbitControls
      enableRotate={false}
      enablePan={false}
      enableZoom={true}
      zoomSpeed={1}
      minDistance={4}
      maxDistance={10}
    />
  )
}

export const Rectangle = ({ imagePath='/The_Wiggsters.jpg', onSpotClick, ...props }) => {
  const groupRef = useRef(null) // Changed from mesh to groupRef
  const router = useRouter()
  const [hovered, hover] = useState(false)
  const [openedDoors, setOpenedDoors] = useState(new Set())
  const { mouse } = useThree()

  const texture = useTexture(imagePath)

  useCursor(hovered)
  useFrame((state, delta) => {
    if (groupRef.current) { // Apply to the entire group
      groupRef.current.rotation.y = mouse.x * 0.3
      groupRef.current.rotation.x = mouse.y * 0.2
    }
  })

  const handleDoorOpen = (doorNumber) => {
    setOpenedDoors(prev => new Set(prev).add(doorNumber))
    console.log(`Door ${doorNumber} opened!`)
  }

  const doors = Array.from({ length: 24 }, (_, i) => {
    const row = Math.floor(i / 6)
    const col = i % 6
    const x = (col - 2.5) * 0.35
    const y = (1.5 - row) * 0.5

    return (
      <Door
        key={i + 1}
        position={[x, y, 0.16]}
        doorNumber={i + 1}
        onOpen={handleDoorOpen}
      />
    )
  })

  return (
    <group ref={groupRef} {...props}>
      <mesh>
        <boxGeometry args={[2.2, 2.8, 0.3]} />
        <meshStandardMaterial
          map={texture}
          color="#8B4513"
        />
      </mesh>
      {doors}
    </group>
  )
}

export const Door = ({ position, doorNumber, onOpen, ...props }) => {
  const doorRef = useRef()
  const [isOpen, setIsOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  const { rotation } = useSpring({
    rotation: isOpen ? [0, Math.PI / 2, 0] : [0, 0, 0],
    config: {
      tension: 200,
      friction: 25
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (!isOpen) {
      setIsOpen(true)
      onOpen?.(doorNumber)
    }
  }

  return (
    <group position={position} {...props}>
      {/* Door frame */}
      <mesh>
        <boxGeometry args={[0.32, 0.45, 0.02]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Door that rotates from right side with animation */}
      <animated.group
        ref={doorRef}
        position={[0.16, 0, 0.01]}
        rotation={rotation}
      >
        <mesh
          position={[-0.15, 0, 0]}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[0.3, 0.43, 0.015]} />
          <meshStandardMaterial
            color={isOpen ? "#654321" : hovered ? "#E2722E" : "#D2691E"}
            roughness={0.8}
          />

          {/* Door number */}
          <mesh position={[0, 0, 0.008]}>
            <boxGeometry args={[0.08, 0.08, 0.002]} />
            <meshStandardMaterial color="white" />
          </mesh>

          {/* Door handle */}
          <mesh position={[-0.12, -0.05, 0.008]}>
            <sphereGeometry args={[0.015]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </mesh>
      </animated.group>

      {/* Content behind door */}
      {isOpen && (
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[0.28, 0.4, 0.01]} />
          <meshStandardMaterial color="#FF6B6B" />
        </mesh>
      )}
    </group>
  )
}
