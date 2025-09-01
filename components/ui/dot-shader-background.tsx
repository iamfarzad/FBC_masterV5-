'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, useTrailTexture } from '@react-three/drei'
import { useTheme } from 'next-themes' // lub twój provider
import * as THREE from 'three'

const DotMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
    dotColor: new THREE.Color('#ff5b04'), // ✅ BRAND LAW: Use actual brand color as fallback
    bgColor: new THREE.Color('#f5f5f5'),  // ✅ BRAND LAW: Use actual background as fallback
    mouseTrail: null,
    render: 0,
    rotation: 0,
    gridSize: 50,
    dotOpacity: 0.05,
    prefersReducedMotion: 0
  },
  /* glsl */ `
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  /* glsl */ `
    uniform float time;
    uniform int render;
    uniform vec2 resolution;
    uniform vec3 dotColor;
    uniform vec3 bgColor;
    uniform sampler2D mouseTrail;
    uniform float rotation;
    uniform float gridSize;
    uniform float dotOpacity;
    uniform float prefersReducedMotion;

    vec2 rotate(vec2 uv, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        mat2 rotationMatrix = mat2(c, -s, s, c);
        return rotationMatrix * (uv - 0.5) + 0.5;
    }

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    float sdfCircle(vec2 p, float r) {
        return length(p - 0.5) - r;
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);

      vec2 rotatedUv = rotate(uv, rotation);

      // Create a grid
      vec2 gridUv = fract(rotatedUv * gridSize);
      vec2 gridUvCenterInScreenCoords = rotate((floor(rotatedUv * gridSize) + 0.5) / gridSize, -rotation);

      // Calculate distance from the center of each cell
      float baseDot = sdfCircle(gridUv, 0.25);

      // Screen mask
      float screenMask = smoothstep(0.0, 1.0, 1.0 - uv.y); // 0 at the top, 1 at the bottom
      vec2 centerDisplace = vec2(0.7, 1.1);
      float circleMaskCenter = length(uv - centerDisplace);
      float circleMaskFromCenter = smoothstep(0.5, 1.0, circleMaskCenter);
      
      float combinedMask = screenMask * circleMaskFromCenter;
      // Respect reduced motion preference
      float animationSpeed = prefersReducedMotion > 0.5 ? 0.0 : 2.0;
      float circleAnimatedMask = sin(time * animationSpeed + circleMaskCenter * 10.0);

      // Mouse trail effect (only if motion is allowed)
      float mouseInfluence = prefersReducedMotion > 0.5 ? 0.0 : texture2D(mouseTrail, gridUvCenterInScreenCoords).r;
      
      float scaleInfluence = max(mouseInfluence * 0.5, circleAnimatedMask * 0.3);

      // Create dots with animated scale, influenced by mouse
      float dotSize = min(pow(circleMaskCenter, 2.0) * 0.3, 0.3);

      float sdfDot = sdfCircle(gridUv, dotSize * (1.0 + scaleInfluence * 0.5));

      float smoothDot = smoothstep(0.05, 0.0, sdfDot);

      float opacityInfluence = max(mouseInfluence * 50.0, circleAnimatedMask * 0.5);

      // Mix background color with dot color, using animated opacity to increase visibility
      vec3 composition = mix(bgColor, dotColor, smoothDot * combinedMask * dotOpacity * (1.0 + opacityInfluence));

      gl_FragColor = vec4(composition, 1.0);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
)

function Scene() {
  const size = useThree((s) => s.size)
  const viewport = useThree((s) => s.viewport)
  const { theme } = useTheme()
  
  const rotation = 0
  const gridSize = 80

  const getThemeColors = () => {
    // ✅ CORRECT: Use CSS custom properties instead of hardcoded values
    if (typeof window !== 'undefined') {
      const root = getComputedStyle(document.documentElement)

      // Always use brand color from theme system
      const brandColor = root.getPropertyValue('--brand').trim()
      const bgColor = root.getPropertyValue('--bg').trim()

      return {
        dotColor: brandColor || '#ff5b04', // fallback to brand color if CSS var fails
        bgColor: bgColor || '#f5f5f5',     // fallback to light background
        dotOpacity: theme === 'dark' ? 0.08 : 0.25
      }
    }

    // Server-side fallback - use theme tokens
    return {
      dotColor: 'var(--brand)',
      bgColor: 'var(--bg)',
      dotOpacity: 0.05
    }
  }

  const themeColors = getThemeColors()

  const [trail, onMove] = useTrailTexture({
    size: 512,
    radius: 0.1,
    maxAge: 400,
    interpolate: 1,
    ease: function easeInOutCirc(x) {
      return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
    }
  })

  const dotMaterial = useMemo(() => {
    return new DotMaterial()
  }, [])

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  useEffect(() => {
    const uniforms = dotMaterial.uniforms
    if (uniforms) {
      try {
        // Convert HSL to RGB for Three.js
        const dotColorRGB = themeColors.dotColor.startsWith('hsl')
          ? new THREE.Color().setStyle(themeColors.dotColor)
          : new THREE.Color(themeColors.dotColor)
        const bgColorRGB = themeColors.bgColor.startsWith('hsl')
          ? new THREE.Color().setStyle(themeColors.bgColor)
          : new THREE.Color(themeColors.bgColor)

        uniforms.dotColor?.value.copy(dotColorRGB)
        uniforms.bgColor?.value.copy(bgColorRGB)

        if (uniforms.dotOpacity) {
          uniforms.dotOpacity.value = themeColors.dotOpacity
        }
        if (uniforms.prefersReducedMotion) {
          uniforms.prefersReducedMotion.value = prefersReducedMotion ? 1.0 : 0.0
        }
      } catch (error) {
        console.warn('Error setting shader colors:', error)
      }
    }
  }, [theme, dotMaterial, themeColors, prefersReducedMotion])

  useFrame((state) => {
    if (dotMaterial.uniforms?.time) {
      dotMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    // Only handle mouse movement if reduced motion is not preferred
    if (!prefersReducedMotion) {
      onMove(e)
    }
  }

  const scale = Math.max(viewport.width, viewport.height) / 2

  return (
    <mesh scale={[scale, scale, 1]} onPointerMove={handlePointerMove}>
      <planeGeometry args={[2, 2]} />
      <primitive
        object={dotMaterial}
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
        rotation={rotation}
        gridSize={gridSize}
        mouseTrail={trail}
        render={0}
      />
    </mesh>
  )
}

export const DotScreenShader = () => {
  // Check for reduced motion preference at component level
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  // Error fallback for when WebGL is not supported
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Listen for changes to reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Show loading state briefly, then fallback if needed
  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background animate-pulse" />
    )
  }

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
    )
  }

  return (
    <Canvas
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.NoToneMapping,
        failIfMajorPerformanceCaveat: false // Allow software rendering as fallback
      }}
      // Performance optimizations
      dpr={prefersReducedMotion ? 1 : (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1)} // Cap DPR for performance
      frameloop={prefersReducedMotion ? 'never' : 'always'} // Disable frame loop if reduced motion
      camera={{ position: [0, 0, 1], fov: 75 }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        // Additional error handling and loading state
        gl.setPixelRatio(prefersReducedMotion ? 1 : (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1))
        setIsLoading(false)
      }}
      onError={() => setHasError(true)}
    >
      <Scene />
    </Canvas>
  )
}