// src/components/SeedColorModal.tsx (or appropriate path)
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { type RgbaColor } from 'react-colorful' // Assuming type is exported
import { toast } from 'react-toastify'

// --- Basic Color String Parsing Functions ---
// These are simplified parsers. Robust parsing can be complex.
// Consider using a library like 'color-string' or 'colord' for production.

// Basic Hex Parser (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
function parseHex(hex: string): RgbaColor | null {
  hex = hex.trim().replace(/^#/, '')
  let r = 0,
    g = 0,
    b = 0,
    a = 1

  if (hex.length === 3 || hex.length === 4) {
    // #RGB or #RGBA
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
    if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255
  } else if (hex.length === 6 || hex.length === 8) {
    // #RRGGBB or #RRGGBBAA
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
    if (hex.length === 8) a = parseInt(hex.substring(6, 8), 16) / 255
  } else {
    return null // Invalid length
  }

  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null // Invalid character
  return { r, g, b, a }
}

// Basic RGBA Parser (rgb(r,g,b) or rgba(r,g,b,a)) - handles spaces loosely
function parseRgba(rgbaStr: string): RgbaColor | null {
  const match = rgbaStr.match(/rgba?\((\s*\d+\s*),(\s*\d+\s*),(\s*\d+\s*)(?:,(\s*[\d.]+\s*))?\)/i)
  if (!match) return null
  const r = parseInt(match[1].trim(), 10)
  const g = parseInt(match[2].trim(), 10)
  const b = parseInt(match[3].trim(), 10)
  const a = match[4] ? parseFloat(match[4].trim()) : 1

  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a) || r > 255 || g > 255 || b > 255 || a < 0 || a > 1) {
    return null
  }
  return { r, g, b, a }
}

// Basic HSL Parser (hsl(h,s%,l%) or hsla(h,s%,l%,a)) - handles spaces loosely
function parseHsl(hslStr: string): RgbaColor | null {
  const match = hslStr.match(/hsla?\((\s*\d+\s*),(\s*\d+%?\s*),(\s*\d+%?\s*)(?:,(\s*[\d.]+\s*))?\)/i)
  if (!match) return null
  const h = parseInt(match[1].trim(), 10)
  const s = parseFloat(match[2].trim().replace('%', '')) // Remove % if present
  const l = parseFloat(match[3].trim().replace('%', '')) // Remove % if present
  const a = match[4] ? parseFloat(match[4].trim()) : 1

  if (isNaN(h) || isNaN(s) || isNaN(l) || isNaN(a) || h > 360 || s > 100 || l > 100 || a < 0 || a > 1) {
    return null
  }

  // Need hslToRgba conversion here (pass as prop or import if utility)
  // For simplicity here, we'll just return null if hslToRgba isn't available
  // In a real app, ensure hslToRgba is accessible
  if (typeof hslToRgba === 'function') {
    // Assuming hslToRgba is available globally/imported
    return hslToRgba({ h, s, l, a })
  } else {
    console.error('hslToRgba function not available for parsing HSL string.')
    return null // Or handle differently
  }
}

// --- Define props for the modal ---
interface SeedColorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { seedColor: RgbaColor; showInverse: boolean; showPalette: boolean }) => void
  initialShowInverse: boolean
  initialShowPalette: boolean
}

// --- HSL to RGBA Conversion Function (needed for HSL parsing) ---
// MUST include the hslToRgba function definition here if not imported
// from a shared utility file. Copied from previous context for completeness.
interface HslColor {
  h: number
  s: number
  l: number
  a: number
}
function hslToRgba({ h, s, l, a }: HslColor): RgbaColor {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const chroma = s * Math.min(l, 1 - l)
  const f = (n: number) => l - chroma * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)), a }
}

// --- The Modal Component ---
const SeedColorModal: React.FC<SeedColorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialShowInverse,
  initialShowPalette,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [modalShowInverse, setModalShowInverse] = useState(initialShowInverse)
  const [modalShowPalette, setModalShowPalette] = useState(initialShowPalette)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)

  // Check EyeDropper support on mount
  useEffect(() => {
    if ('EyeDropper' in window) {
      setIsEyeDropperSupported(true)
    }
  }, [])

  // Update internal checkbox state if props change while open
  useEffect(() => {
    setModalShowInverse(initialShowInverse)
    setModalShowPalette(initialShowPalette)
  }, [initialShowInverse, initialShowPalette, isOpen])

  // Handle click outside modal
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    },
    [onClose]
  )

  // Handle Escape key
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      // Reset input on open
      setInputValue('')
      setErrorMsg(null)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, handleClickOutside, handleEscapeKey])

  const tryParseColor = (value: string): RgbaColor | null => {
    setErrorMsg(null) // Clear previous error
    const trimmedValue = value.trim()
    let parsedColor: RgbaColor | null = null

    if (trimmedValue.startsWith('#')) {
      parsedColor = parseHex(trimmedValue)
    } else if (trimmedValue.toLowerCase().startsWith('rgb')) {
      parsedColor = parseRgba(trimmedValue)
    } else if (trimmedValue.toLowerCase().startsWith('hsl')) {
      parsedColor = parseHsl(trimmedValue) // Assumes hslToRgba is defined/imported
    } else {
      // Maybe try hex without # as a last resort?
      parsedColor = parseHex(trimmedValue)
    }

    if (!parsedColor) {
      setErrorMsg(`Invalid color format: "${value}"`)
    }
    return parsedColor
  }

  const handleSubmit = () => {
    const seedColor = tryParseColor(inputValue)
    if (seedColor) {
      onSubmit({
        seedColor,
        showInverse: modalShowInverse,
        showPalette: modalShowPalette,
      })
      // No need to call onClose here, onSubmit in parent does it
    }
    // Error message is set by tryParseColor if needed
  }

  const handleEyeDropper = async () => {
    if (!isEyeDropperSupported) {
      toast.error('EyeDropper API not supported in your browser.')
      return
    }
    try {
      // @ts-expect-error - EyeDropper might not be in default TS Window type yet
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open() // Opens the eyedropper
      const pickedColor = parseHex(result.sRGBHex) // Use the hex parser
      if (pickedColor) {
        onSubmit({
          // Directly submit picked color
          seedColor: pickedColor,
          showInverse: modalShowInverse,
          showPalette: modalShowPalette,
        })
      } else {
        toast.error('Failed to parse picked color.')
      }
    } catch (e) {
      console.info('EyeDropper cancelled or failed:', e)
      // User likely cancelled, no error message needed unless it's an actual error
      if (e instanceof Error && !e.message.toLowerCase().includes('abort')) {
        toast.error('EyeDropper failed.')
      }
    }
  }

  if (!isOpen) return null // Don't render anything if not open

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 backdrop-blur-sm p-4'>
      <div
        ref={modalRef}
        className='bg-gray-800 text-white rounded-lg shadow-xl p-5 border border-gray-700 w-full max-w-md'
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Set Seed Color</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white text-2xl'>
            ×
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <label htmlFor='seedColorInput' className='block text-sm font-medium text-gray-300 mb-1'>
              Enter Color (Hex, RGBA, HSL):
            </label>
            <input
              type='text'
              id='seedColorInput'
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder='#dddd27 or rgba(221, 221, 39, 1) or hsl(60, 73%, 51%)'
              className={`w-full px-3 py-2 bg-gray-900 border ${
                errorMsg ? 'border-red-500' : 'border-gray-700'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
            />
            {errorMsg && <p className='text-red-500 text-xs mt-1'>{errorMsg}</p>}
          </div>

          {/* EyeDropper Section - Conditional Rendering */}
          <div>
            {isEyeDropperSupported ? (
              // Render Button if supported
              <button
                onClick={handleEyeDropper}
                className='w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm flex items-center justify-center gap-2'
                title='Pick color from anywhere on screen' // Updated title
              >
                {/* SVG Icon */}
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='w-4 h-4'>
                  <path d='M5.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z' />
                  <path
                    fillRule='evenodd'
                    d='M11.07 3.546c.18-.191.46-.296.74-.296s.56.105.74.296l1.058 1.116a.75.75 0 0 0 1.067-1.058L13.617 2.54C12.987 1.873 12.05 1.5 11 1.5S9.013 1.873 8.383 2.54L3.34 7.887a.75.75 0 0 0 1.06 1.06l1.48-1.481v5.57a.75.75 0 0 0 1.5 0V7.76l1.003-1.054c.11-.116.248-.21.396-.283l.018-.009.017-.009-.017.009a1.61 1.61 0 0 1 .712-.177ZM8.93 13.25a.75.75 0 0 0-1.06 1.06l4.031 4.031a.75.75 0 1 0 1.06-1.06l-1.022-1.023l2.475-1.06a.75.75 0 1 0-.53-1.417l-3.954 1.694Z'
                    clipRule='evenodd'
                  />
                </svg>
                Use Eyedropper (Screen-wide)
              </button>
            ) : (
              // Render clearer message if not supported
              <div className='text-center p-2 bg-gray-700/50 rounded border border-gray-600'>
                <p className='text-xs text-gray-400 italic'>
                  Screen-wide Eyedropper tool not supported by this browser.
                </p>
                <p className='text-xs text-gray-500 italic mt-0.5'>(Try Chrome or Edge)</p>
              </div>
            )}
          </div>

          <div className='border border-gray-700 rounded px-3 pt-2 pb-3 relative mt-4'>
            <div className='absolute -top-2 left-2 px-1 bg-gray-800 text-xs font-medium text-gray-400'>
              Options on Submit:
            </div>
            <div className='flex flex-col items-start sm:flex-row sm:items-center gap-2 mt-2 sm:gap-6'>
              <label htmlFor='modalShowInverse' className='inline-flex items-center gap-2 cursor-pointer text-sm'>
                <input
                  type='checkbox'
                  id='modalShowInverse'
                  checked={modalShowInverse}
                  onChange={e => setModalShowInverse(e.target.checked)}
                  className='h-4 w-4 accent-blue-500'
                />
                <span className='whitespace-nowrap'>Show Inverse Color</span>
              </label>
              <label htmlFor='modalShowPalette' className='inline-flex items-center gap-2 cursor-pointer text-sm'>
                <input
                  type='checkbox'
                  id='modalShowPalette'
                  checked={modalShowPalette}
                  onChange={e => setModalShowPalette(e.target.checked)}
                  className='h-4 w-4 accent-blue-500'
                />
                <span className='whitespace-nowrap'>Show Complementary Palette</span>
              </label>
            </div>
          </div>
        </div>

        <div className='mt-5 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm'>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm'>
            Set Color
          </button>
        </div>
      </div>
    </div>
  )
}

export default SeedColorModal
