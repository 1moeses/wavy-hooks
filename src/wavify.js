import React, {
  Component,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'

const defaults = {
  height: 20,
  amplitude: 20,
  speed: 0.15,
  points: 3,
}

const Wave = ({ options, ...rest }) => (
  <>
    <WaveBase {...defaults} {...options} {...rest} />
    {/* <WaveBaseRewrite {...defaults} {...options} {...rest} /> */}
  </>
)

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

const WaveBase = ({
  amplitude = 20,
  speed = 0.15,
  points = 3,
  paused = false,
  fill = '#fff',
  lastUpdate = 0,
  elapsed = 0,
  step = 0,
  children = null,
  style,
  id,
  className,
  width = 30,
}) => {
  const [path, setPath] = useState('')
  const containerRef = useRef({ offsetWidth: 0, offsetHeight: 0 })
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
      const height = Math.sin(seed / scale) * amplitude
      const y = Math.sin(seed / scale) * height + waveHeight
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

/* ------------------- */
/* --      OLD      -- */
/* ------------------- */

class WaveBaseRewrite extends Component {
  constructor(props) {
    super(props)
    this.container = React.createRef()
    this.state = { path: '' }
    this.lastUpdate = 0
    this.elapsed = 0
    this.step = 0
    this.update = this.update.bind(this)
  }

  calculateWavePoints() {
    const points = []
    for (let i = 0; i <= Math.max(this.props.points, 1); i++) {
      const scale = 100
      const x = (i / this.props.points) * this.width()
      const seed =
        (this.step + (i + (i % this.props.points))) * this.props.speed * scale
      const height = Math.sin(seed / scale) * this.props.amplitude
      const y = Math.sin(seed / scale) * height + this.props.height
      points.push({ x, y })
    }
    return points
  }

  buildPath(points) {
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
    svg += ` L ${this.width()} ${this.height()}`
    svg += ` L 0 ${this.height()} Z`

    return svg
  }

  width = () => this.container.current.offsetWidth
  height = () => this.container.current.offsetHeight

  redraw() {
    this.setState({
      path: this.buildPath(this.calculateWavePoints()),
    })
  }

  draw() {
    if (!this.props.paused) {
      const now = new Date()
      this.elapsed += now - this.lastUpdate
      this.lastUpdate = now
    }
    const scale = 1000
    this.step = (this.elapsed * Math.PI) / scale
    this.redraw()
  }

  update() {
    this.draw()
    if (this.frameId) {
      this.resume()
    }
  }

  resume() {
    this.frameId = window.requestAnimationFrame(this.update)
    this.lastUpdate = new Date()
  }

  componentDidMount() {
    if (!this.frameId) {
      this.resume()
    }
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.frameId)
    this.frameId = 0
  }

  render() {
    const {
      style,
      className,
      fill,
      paused,
      children,
      id,
      d,
      ref,
      ...rest
    } = this.props
    return (
      <div
        style={{ width: '100%', display: 'inline-block', ...style }}
        className={className}
        id={id}
        ref={this.container}
      >
        <svg
          width="100%"
          height="100%"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          {children}
          <path d={this.state.path} fill={fill} {...rest} />
        </svg>
      </div>
    )
  }
}

export default Wave
