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

export default buildPath
