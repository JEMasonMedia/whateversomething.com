import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Card from './Card'
import { RgbaColorPicker, type RgbaColor } from 'react-colorful'
import { toast } from 'react-toastify'
import SeedColorModal from './SeedColorModal'
import './cpnt.css'
import 'react-toastify/dist/ReactToastify.css'

// HslColor interface and utility functions (rgbaToHex, rgbaToHsl, etc.) should be here...
// Assume they are correct and present from previous versions.
interface HslColor {
  h: number
  s: number
  l: number
  a: number
}
/**
 * Converts an RGBA color object to a Hex string (e.g., #RRGGBB or #RRGGBBAA).
 * Omits the alpha channel if it's fully opaque (1.0).
 */
function rgbaToHex({ r, g, b, a }: RgbaColor): string {
  const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0')
  const alpha = Math.round(a * 255)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha === 255 ? '' : toHex(alpha)}`
}

/**
 * Converts an RGBA color object to an HSL color object.
 * H is degrees (0-360), S and L are percentages (0-100), A is 0-1.
 */
function rgbaToHsl({ r, g, b, a }: RgbaColor): HslColor {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / d + 2
        break
      case bNorm:
        h = (rNorm - gNorm) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a,
  }
}

/**
 * Converts an HSL color object (H: 0-360, S: 0-100, L: 0-100, A: 0-1)
 * to an RGBA color object (R, G, B: 0-255, A: 0-1).
 */
function hslToRgba({ h, s, l, a }: HslColor): RgbaColor {
  const sat = s / 100 // Normalize saturation to 0-1
  const lig = l / 100 // Normalize lightness to 0-1

  const k = (n: number) => (n + h / 30) % 12
  const chroma = sat * Math.min(lig, 1 - lig)
  const f = (n: number): number => lig - chroma * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

  return {
    r: Math.round(255 * f(0)), // Red component
    g: Math.round(255 * f(8)), // Green component
    b: Math.round(255 * f(4)), // Blue component
    a,
  }
}

/**
 * Calculates the simple inverse (negative) of an RGBA color.
 */
function getInverseColor({ r, g, b, a }: RgbaColor): RgbaColor {
  return {
    r: 255 - r,
    g: 255 - g,
    b: 255 - b,
    a, // Alpha channel usually remains the same for inverse
  }
}

/**
 * Generates a complementary color palette based on a base RGBA color.
 * Includes the base color, complementary, split-complementary, and analogous colors.
 * Adjusts saturation/lightness for grayscale inputs to provide vibrant suggestions.
 * @param baseColor The starting RGBA color.
 * @param count The desired number of colors in the palette (default 5).
 * @returns An array of RGBAColor objects representing the palette.
 */
function generateComplementaryPalette(baseColor: RgbaColor, count: number = 5): RgbaColor[] {
  const baseHsl = rgbaToHsl(baseColor)
  const palette: RgbaColor[] = [baseColor] // Start with the base color

  // Check if the base color is near grayscale
  const isBaseGrayscale = baseHsl.s < 10 || baseHsl.l < 10 || baseHsl.l > 90

  // Determine saturation and lightness for derived colors
  const derivedSaturation = isBaseGrayscale ? 75 : baseHsl.s // Use vibrant saturation if grayscale
  const derivedLightness = isBaseGrayscale ? 50 : baseHsl.l // Use mid-lightness if grayscale

  // Helper to create HSL for derived colors with specific hue offset
  const createDerivedHsl = (hueAngleOffset: number): HslColor => ({
    h: (baseHsl.h + hueAngleOffset + 360) % 360, // Add offset and ensure hue is 0-359
    s: derivedSaturation,
    l: derivedLightness,
    a: baseHsl.a,
  })

  // Define hue offsets for standard color harmonies relative to the base hue
  const harmonyOffsets = [
    180, // Complementary
    150, // Split Complementary 1 (Comp - 30)
    210, // Split Complementary 2 (Comp + 30)
    30, // Analogous 1 (Base + 30)
    -30, // Analogous 2 (Base - 30)
    // Add more angles like 120, 240 (Triadic) or 90, 270 (Tetradic) if needed for larger counts
  ]

  // Generate derived colors up to the desired count
  for (let i = 0; i < harmonyOffsets.length && palette.length < count; i++) {
    palette.push(hslToRgba(createDerivedHsl(harmonyOffsets[i])))
  }

  // Ensure the final palette has exactly 'count' colors
  return palette.slice(0, count)
}

/**
 * Generates a random RGBA color biased towards medium/bright saturation and lightness.
 * Avoids very dark or very desaturated colors.
 * @returns An RgbaColor object.
 */
function getRandomLightColor(): RgbaColor {
  // Hue: Full range (0-359 degrees)
  const randomHue = Math.floor(Math.random() * 360)

  // Saturation: Keep it reasonably high (e.g., 60% - 100%) for vividness
  const randomSaturation = Math.floor(60 + Math.random() * 40)

  // Lightness: Keep it in the mid-to-upper range (e.g., 45% - 70%)
  // Avoids very dark (< 40%) and very washed-out/white (> 75-80%)
  const randomLightness = Math.floor(45 + Math.random() * 25)

  // Alpha: Fully opaque
  const randomAlpha = 1.0

  // Create the random HSL color
  const randomHsl: HslColor = {
    h: randomHue,
    s: randomSaturation,
    l: randomLightness,
    a: randomAlpha,
  }

  // Convert the random HSL color to RGBA
  const randomRgba = hslToRgba(randomHsl)

  return randomRgba
}

const ColorPicker: React.FC = () => {
  const [color, setColor] = useState<RgbaColor>(getRandomLightColor())
  const [showInverse, setShowInverse] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showPaletteValues, setShowPaletteValues] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Add these functions within the ColorPicker component
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // Handles data submitted from the modal
  const handleSeedSubmit = (data: { seedColor: RgbaColor; showInverse: boolean; showPalette: boolean }) => {
    setColor(data.seedColor) // Update main color state
    setShowInverse(data.showInverse) // Update inverse visibility state
    setShowPalette(data.showPalette) // Update palette visibility state
    closeModal() // Close the modal after submission
  }

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    colorData: RgbaColor
  } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const handleColorChange = (newColor: RgbaColor) => setColor(newColor)

  const mainHex = useMemo(() => rgbaToHex(color), [color])
  const mainHsl = useMemo(() => rgbaToHsl(color), [color])
  const inverseRgba = useMemo(() => getInverseColor(color), [color])
  const inverseHex = useMemo(() => rgbaToHex(inverseRgba), [inverseRgba])
  const inverseHsl = useMemo(() => rgbaToHsl(inverseRgba), [inverseRgba])
  const complementaryPalette = useMemo(() => generateComplementaryPalette(color, 5), [color])

  const handleContextMenuAction = (event: React.MouseEvent, colorData: RgbaColor) => {
    event.preventDefault()
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      colorData,
    })
  }

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, []) // Empty dependency array is correct as setContextMenu is stable

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        closeContextMenu()
      }
    }
    if (contextMenu?.visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu, closeContextMenu]) // Dependencies are correct

  // --- REFINED copyToClipboard function ---
  const copyToClipboard = async (text: string, formatName: string) => {
    // Use a toastId to prevent visual duplicates if events fire rapidly
    const uniqueToastId = `copy-${formatName}-${Date.now()}`
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Use modern API - MUST await the promise
        await navigator.clipboard.writeText(text)
        toast.success(`Copied ${formatName}!`, { toastId: uniqueToastId })
      } else {
        // Use fallback
        console.warn('Using fallback copy method.')
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed' // Prevent scrolling to bottom
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.opacity = '0'
        textArea.style.pointerEvents = 'none'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (successful) {
          toast.success(`Copied ${formatName} (fallback)!`, { toastId: uniqueToastId })
        } else {
          // Throw error to be caught by the catch block
          throw new Error('Fallback: document.execCommand("copy") failed')
        }
      }
    } catch (err) {
      console.error('Copy process failed:', err)
      // Use a different ID for error toast to ensure it shows even if success was attempted
      toast.error(`Copy failed!`, { toastId: `error-${uniqueToastId}` })
    } finally {
      // Ensure context menu is always closed after the operation attempt
      closeContextMenu()
    }
  }

  return (
    <Card title='Color Picker'>
      {/* Layout sections */}
      <div className='flex flex-col sm:flex-row w-full rounded-lg text-white gap-3'>
        {/* Color Picker */}
        <div
          className='color-picker-wrapper w-full h-[220px] sm:w-[240px] sm:h-[240px] shrink-0'
          onContextMenu={e => handleContextMenuAction(e, color)}>
          <RgbaColorPicker color={color} onChange={handleColorChange} />
        </div>

        {/* Info/Options/Swatches Area */}
        <div className='flex-1 flex flex-col gap-3'>
          {/* Info & Options row */}
          <div className='flex flex-col sm:flex-row sm:items-start gap-3'>
            <div className='flex flex-col gap-1 text-sm sm:flex-grow'>
              <span>Hex: {mainHex}</span>
              <span>
                RGBA: rgba({color.r}, {color.g}, {color.b}, {color.a.toFixed(2)})
              </span>
              <span>
                HSL: hsl({mainHsl.h}°, {mainHsl.s}%, {mainHsl.l}%, {mainHsl.a.toFixed(2)})
              </span>
            </div>
            <div className='flex flex-col items-start sm:items-end gap-1.5 text-sm sm:ml-auto sm:shrink-0'>
              <button
                onClick={openModal} // We will define openModal later
                className='px-3 py-1.5 rounded-md text-xs font-medium shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900'
                style={{
                  backgroundColor: `rgba(${inverseRgba.r}, ${inverseRgba.g}, ${inverseRgba.b}, ${inverseRgba.a})`,
                  // Determine text color based on inverse color lightness for contrast
                  color: inverseHsl.l > 55 ? 'black' : 'white',
                  // Add a subtle border matching text color
                  borderColor: inverseHsl.l > 55 ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
                title='Set color via text input or eyedropper'>
                Seed/Pick Color
              </button>
              <label htmlFor='showInverse' className='inline-flex items-center gap-2 cursor-pointer whitespace-nowrap'>
                <input
                  type='checkbox'
                  id='showInverse'
                  checked={showInverse}
                  onChange={e => setShowInverse(e.target.checked)}
                  className='h-4 w-4 accent-blue-500'
                />{' '}
                Inverse Color
              </label>
              <label htmlFor='showPalette' className='inline-flex items-center gap-2 cursor-pointer whitespace-nowrap'>
                <input
                  type='checkbox'
                  id='showPalette'
                  checked={showPalette}
                  onChange={e => setShowPalette(e.target.checked)}
                  className='h-4 w-4 accent-blue-500'
                />{' '}
                Complementary Palette
              </label>
            </div>
          </div>

          {/* Instruction Text */}
          <div className='text-center text-xs text-gray-400 mt-1'>
            Right-click (or long press on mobile) on swatches or table rows to copy color values.
          </div>

          {/* Selected/Inverse Swatches */}
          <div className={`flex flex-col sm:flex-row ${showInverse ? 'sm:gap-1.5' : ''}`}>
            {/* Selected */}
            <div className={`${showInverse ? 'sm:w-1/2' : 'sm:w-full'} w-full`}>
              <p className='text-xs font-medium mb-0.5'>Selected Color:</p>
              <div
                className='w-full h-8 rounded border border-gray-700 shadow-md cursor-context-menu'
                style={{ background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` }}
                onContextMenu={e => handleContextMenuAction(e, color)}
                title={`Hex: #${mainHex}\nRGBA: (${color.r},${color.g},${color.b},${color.a.toFixed(2)})\nHSL: (${
                  mainHsl.h
                }°,${mainHsl.s}%,${mainHsl.l}%,${mainHsl.a.toFixed(2)})`}></div>
            </div>
            {/* Inverse */}
            {showInverse && (
              <div className='sm:w-1/2 w-full mt-1.5 sm:mt-0'>
                <p className='text-xs font-medium mb-0.5'>Inverse Color:</p>
                <div
                  className='w-full h-8 rounded border border-gray-700 shadow-md cursor-context-menu'
                  style={{ background: `rgba(${inverseRgba.r}, ${inverseRgba.g}, ${inverseRgba.b}, ${inverseRgba.a})` }}
                  onContextMenu={e => handleContextMenuAction(e, inverseRgba)}
                  title={`Hex: #${inverseHex}\nRGBA: (${inverseRgba.r},${inverseRgba.g},${
                    inverseRgba.b
                  },${inverseRgba.a.toFixed(2)})\nHSL: (${inverseHsl.h}°,${inverseHsl.s}%,${
                    inverseHsl.l
                  }%,${inverseHsl.a.toFixed(2)})`}></div>
              </div>
            )}
          </div>

          {/* Palette Section */}
          {showPalette && (
            <div className='flex flex-col gap-1.5 mt-1.5'>
              {/* Palette Header + Show Values Checkbox */}
              <div className='flex items-center justify-between'>
                <p className='text-xs font-medium'>Complementary Palette:</p>
                <label
                  htmlFor='showPaletteValues'
                  className='inline-flex items-center gap-1.5 text-xs cursor-pointer whitespace-nowrap'>
                  <input
                    type='checkbox'
                    id='showPaletteValues'
                    checked={showPaletteValues}
                    onChange={e => setShowPaletteValues(e.target.checked)}
                    className='h-3.5 w-3.5 accent-blue-500'
                  />{' '}
                  Show Values
                </label>
              </div>
              {/* Palette Swatches (Centered) */}
              <div className='flex justify-center'>
                <div className='flex flex-row flex-wrap gap-1.5'>
                  {complementaryPalette.map((pColor, index) => (
                    <div
                      key={index}
                      title={`Hex: #${rgbaToHex(pColor)}\nRGBA: (${pColor.r},${pColor.g},${pColor.b},${pColor.a.toFixed(
                        2
                      )})\nHSL: (${rgbaToHsl(pColor).h}°,${rgbaToHsl(pColor).s}%,${rgbaToHsl(pColor).l}%,${rgbaToHsl(
                        pColor
                      ).a.toFixed(2)})`}
                      className='w-9 h-9 sm:w-10 sm:h-10 rounded border border-gray-700 shadow-md cursor-context-menu'
                      style={{ background: `rgba(${pColor.r}, ${pColor.g}, ${pColor.b}, ${pColor.a})` }}
                      onContextMenu={e => handleContextMenuAction(e, pColor)}></div>
                  ))}
                </div>
              </div>
              {/* Palette Values Table */}
              {showPaletteValues && (
                <div className='mt-1.5 bg-gray-800 py-2 px-[10px] rounded-md shadow-sm overflow-x-auto'>
                  <table className='text-xs border-collapse table-fixed sm:mx-auto'>
                    {/* thead and tbody as before */}
                    <thead className='border-b border-gray-700'>
                      <tr>
                        <th className='p-1.5 text-center font-medium w-12'>Swatch</th>
                        <th className='p-1.5 text-center font-medium w-[6.5rem]'>Hex</th>
                        <th className='p-1.5 text-center font-medium w-[11rem]'>RGBA</th>
                        <th className='p-1.5 text-center font-medium w-[11rem]'>HSL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complementaryPalette.map((pColor, index) => {
                        const pColorHex = rgbaToHex(pColor)
                        const pColorHslVal = rgbaToHsl(pColor)
                        return (
                          <tr
                            key={index}
                            className='border-b border-gray-600 last:border-b-0 hover:bg-gray-700/50 cursor-context-menu'
                            onContextMenu={e => handleContextMenuAction(e, pColor)}>
                            <td className='p-1.5 text-center align-middle'>
                              <div
                                className='w-5 h-5 rounded-sm border border-gray-500 inline-block'
                                style={{
                                  backgroundColor: `rgba(${pColor.r}, ${pColor.g}, ${pColor.b}, ${pColor.a})`,
                                }}></div>
                            </td>
                            <td className='p-1.5 text-center font-mono align-middle whitespace-nowrap'>#{pColorHex}</td>
                            <td className='p-1.5 text-center font-mono align-middle whitespace-nowrap'>
                              ({pColor.r}, {pColor.g}, {pColor.b}, {pColor.a.toFixed(2)})
                            </td>
                            <td className='p-1.5 text-center font-mono align-middle whitespace-nowrap'>
                              ({pColorHslVal.h}°, {pColorHslVal.s}%, {pColorHslVal.l}%, {pColorHslVal.a.toFixed(2)})
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render the Seed Color Modal Conditionally */}
      <SeedColorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSeedSubmit}
        initialShowInverse={showInverse} // Pass current state as initial
        initialShowPalette={showPalette} // Pass current state as initial
      />

      {/* Custom Context Menu */}
      {contextMenu?.visible && contextMenu.colorData && (
        <div
          ref={contextMenuRef}
          className='fixed bg-gray-700 text-white text-sm rounded-md shadow-lg p-2 z-50 border border-gray-600'
          style={{ top: contextMenu.y, left: contextMenu.x }}>
          {/* Make buttons call the async function directly */}
          <button
            className='block w-full text-left px-3 py-1.5 hover:bg-gray-600 rounded'
            onClick={() => copyToClipboard(`#${rgbaToHex(contextMenu.colorData!)}`, 'Hex')}>
            Copy Hex
          </button>
          <button
            className='block w-full text-left px-3 py-1.5 hover:bg-gray-600 rounded'
            onClick={() =>
              copyToClipboard(
                `rgba(${contextMenu.colorData!.r}, ${contextMenu.colorData!.g}, ${
                  contextMenu.colorData!.b
                }, ${contextMenu.colorData!.a.toFixed(2)})`,
                'RGBA'
              )
            }>
            Copy RGBA
          </button>
          <button
            className='block w-full text-left px-3 py-1.5 hover:bg-gray-600 rounded'
            onClick={() => {
              const hsl = rgbaToHsl(contextMenu.colorData!)
              copyToClipboard(`hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%, ${hsl.a.toFixed(2)})`, 'HSL')
            }}>
            Copy HSL
          </button>
        </div>
      )}
    </Card>
  )
}

export default ColorPicker
