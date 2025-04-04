"use client"
import { useState } from 'react'
import dynamic from 'next/dynamic'

// Import the component with dynamic import and disable SSR
const Cropper = dynamic(
  () => import('react-easy-crop'),
  { ssr: false }
)

const Demo = () => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Cropper
        image={"https://cdn.mos.cms.futurecdn.net/2NBcYamXxLpvA77ciPfKZW-970-80.jpg"}
        crop={crop}
        zoom={zoom}
        aspect={4 / 3}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
      />
    </div>
  )
}

export default Demo