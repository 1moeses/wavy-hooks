import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import Wave from './wavify.js'
import './style.css'

// Todo: rewrite wavify in hooks and import script
const App = (p) => {
  const options = {
    speed: 0.7,
    fill: 'url(#gradient-blue-red)',
    height: 20,
    width: 20,
    amplitude: 20,
    points: 5,
    paused: false,
    lastUpdate: 0,
    elapsed: 0,
    step: 0,
    children: null,
    style: {},
    id: '',
    className: '',
  }

  const style = {
    zIndex: 10,
  }
  return (
    <div id="wave">
      <Wave style={style} {...options}>
        <defs>
          <linearGradient id="gradient-blue-red" gradientTransform="rotate(90)">
            <stop offset="10%" stopColor="#257" />
            <stop offset="90%" stopColor="#f5576c" />
          </linearGradient>
          <linearGradient id="gradient-red-blue" gradientTransform="rotate(90)">
            <stop offset="50%" stopColor="#f5576c" />
            <stop offset="50%" stopColor="#257" />
          </linearGradient>
        </defs>
      </Wave>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
