'use client'

import { useGLTF, OrbitControls, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber' // Remove extend from here
import * as THREE from 'three'
import { useMemo, useRef, useEffect, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'


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

export const Rectangle = ({ route = '/', imagePath='/The_Wiggsters.jpg', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()
  const [hovered, hover] = useState(false)
  const { mouse } = useThree()

  const texture = useTexture(imagePath)

  useCursor(hovered)
  useFrame((state, delta) => {
    if (mesh.current) {
      // Right type of rotation
      mesh.current.rotation.y = mouse.x * 0.3
      mesh.current.rotation.x = mouse.y * 0.2
      // mesh.current.rotation.z = 0
    }
  })

  return (
    <mesh
      ref={mesh}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}>
      <boxGeometry args={[2, 2.8, 0.3]} />
      <meshStandardMaterial
        map={texture}
        color={hovered ? 'hotpink' : '#1fb2f5'}
      />
    </mesh>
  )
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
