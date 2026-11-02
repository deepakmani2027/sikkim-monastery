declare module 'react-pannellum' {
  import * as React from 'react'

  type HotSpot = {
    pitch: number
    yaw: number
    type?: 'info' | 'scene'
    text?: string
    URL?: string
    sceneId?: string
    clickHandlerFunc?: (event?: any, args?: any) => void
    clickHandlerArgs?: any
  }

  type Config = {
    autoLoad?: boolean
    autoRotate?: number
    showZoomCtrl?: boolean
    showFullscreenCtrl?: boolean
    mouseZoom?: boolean
    draggable?: boolean
    hfov?: number
    minHfov?: number
    maxHfov?: number
    compass?: boolean
    keyboardZoom?: boolean
    doubleClickZoom?: boolean | string
    // Partial panorama support
    haov?: number
    vaov?: number
    vOffset?: number
    hotSpots?: HotSpot[]
  }

  export interface ReactPannellumProps {
    id: string
    sceneId: string
    imageSource?: string
    style?: React.CSSProperties
    className?: string
    config?: Config
  }

  const ReactPannellum: React.FC<ReactPannellumProps>
  export default ReactPannellum

  // Runtime helper APIs
  export function getHfov(): number
  export function setHfov(hfov: number, animated?: boolean | number): void
  export function toggleFullscreen(): void
  export function startOrientation(): void
  export function stopOrientation(): void
}
