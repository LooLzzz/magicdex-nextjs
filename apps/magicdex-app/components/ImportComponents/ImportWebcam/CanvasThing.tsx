import { Button } from '@mantine/core'
import { CanvasHTMLAttributes, DetailedHTMLProps, useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'


// type CanvasProps = DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>

export default function CanvasThing() {
  const webcamRef = useRef<Webcam>(null)
  const canvasCtx = webcamRef?.current?.getCanvas()?.getContext('2d')

  useEffect(() => {
    if (!canvasCtx)
      return

    canvasCtx.fillStyle = 'red'
    canvasCtx.fillRect(0, 0, 100, 100)
  }, [canvasCtx])

  return (
    <Webcam
      ref={webcamRef}
      audio={false}
      videoConstraints={{
        facingMode: 'environment',
      }}
    />
  )
}
