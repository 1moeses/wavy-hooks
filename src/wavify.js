import React, { useState, useEffect, useRef, useCallback } from 'react'

const buildPath = ({ points, waveWidth, waveHeight }) => {
  let svg = `M ${points[0].x} ${points[0].y}`

  const initial = {
    x: (points[1].x - points[0].x) / 2,
    y: points[1].y - points[0].y + points[0].y + (points[1].y - points[0].y),
  }

  const cubic = (a, b) => ` C ${a.x} ${a.y} ${a.x} ${a.y} ${b.x} ${b.y}`

  svg += cubic(initial, points[1])

  let point = initial

  for (let i = 1; i < points.length - 1; i++) {
    point = {
      x: points[i].x - point.x + points[i].x,
      y: points[i].y - point.y + points[i].y,
    }
    svg += cubic(point, points[i + 1])
  }

  svg += ` L ${waveWidth} ${waveHeight}`
  svg += ` L 0 ${waveHeight} Z`

  return svg
}

const Wave = ({
  height = 20,
  width = 20,
  amplitude = 20,
  speed = 0.15,
  points = 3,
  paused = false,
  fill = '#fff',
  lastUpdate = 0,
  elapsed = 0,
  step = 0,
  children = null,
  style = {},
  id = '',
  className = '',
}) => {
  const [path, setPath] = useState('')
  const containerRef = useRef({ offsetWidth: width, offsetHeight: height })
  const lastUpdateRef = useRef(lastUpdate)
  const elapsedRef = useRef(elapsed)
  const stepRef = useRef(step)
  const frameId = useRef(0)

  const waveWidth = containerRef.current.offsetWidth
  const waveHeight = containerRef.current.offsetHeight

  const calculateWavePoints = useCallback(() => {
    const newPoints = []
    for (let i = 0; i <= Math.max(points, 1); i++) {
      const scale = 100
      const x = (i / points) * waveWidth
      const seed = (stepRef.current + (i + (i % points))) * speed * scale
      const calcHeight = Math.sin(seed / scale) * amplitude
      const y = Math.sin(seed / scale) * calcHeight + height
      newPoints.push({ x, y })
    }
    return newPoints
  }, [amplitude, points, speed, waveHeight, waveWidth])

  const redraw = useCallback(() => {
    setPath(
      buildPath({
        points: calculateWavePoints(),
        waveWidth,
        waveHeight,
      })
    )
  }, [calculateWavePoints, waveWidth, waveHeight])

  const draw = useCallback(() => {
    if (!paused) {
      const now = new Date()
      elapsedRef.current += now - lastUpdateRef.current
      lastUpdateRef.current = now
    }
    const scale = 1000
    stepRef.current = (elapsedRef.current * Math.PI) / scale
    redraw()
  }, [paused, redraw])

  const update = useCallback(() => {
    draw()
    if (frameId.current) {
      resume()
    }
  }, [draw, resume])

  const resume = useCallback(() => {
    frameId.current = window.requestAnimationFrame(update)
    lastUpdateRef.current = new Date()
  }, [update])

  useEffect(() => {
    if (!frameId.current) {
      resume()
    }
    return () => {
      window.cancelAnimationFrame(frameId.current)
      frameId.current = 0
    }
  }, [resume])

  return (
    <div
      style={{ width: '100%', display: 'inline-block', ...style }}
      className={className}
      id={id}
      ref={containerRef}
    >
      <svg
        width="100%"
        height="100%"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        {children && children}
        <path
          d={path}
          fill={fill}
          points={points}
          width={waveWidth}
          height={waveHeight}
        />
      </svg>
    </div>
  )
}

export default Wave
