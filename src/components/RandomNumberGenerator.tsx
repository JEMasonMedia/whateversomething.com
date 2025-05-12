import React, { useState } from 'react'
import Card from './Card'
import './cpnt.css'

const RandomNumberGenerator: React.FC = () => {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [result, setResult] = useState<string | null>(null)
  const [allowDecimals, setAllowDecimals] = useState(false)
  const [sigFigs, setSigFigs] = useState(8)
  const [allowNegative, setAllowNegative] = useState(false)

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    let minVal = min
    let maxVal = max
    if (!allowNegative) {
      minVal = Math.max(0, min)
      maxVal = Math.max(0, max)
    }
    if (minVal > maxVal) {
      setResult('Invalid range.')
    } else {
      let randomNumber = Math.random() * (maxVal - minVal) + minVal
      if (!allowDecimals) {
        randomNumber = Math.floor(randomNumber)
        setResult(`${randomNumber}`)
      } else {
        // Use toPrecision for significant figures, but remove trailing zeros
        setResult(
          Number(randomNumber)
            .toPrecision(sigFigs)
            .replace(/\.?0+$/, '')
        )
      }
    }
  }

  return (
    <Card title='Random Number Generator'>
      <form onSubmit={handleGenerate} className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label htmlFor='min' className='block text-sm font-medium p-1'>
              Minimum:
            </label>
            <input
              type='number'
              id='min'
              value={min}
              onChange={e => setMin(Number(e.target.value))}
              className='w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
              step={allowDecimals ? 'any' : '1'}
              min={allowNegative ? undefined : 0}
            />
          </div>
          <div>
            <label htmlFor='max' className='block text-sm font-medium p-1'>
              Maximum:
            </label>
            <input
              type='number'
              id='max'
              value={max}
              onChange={e => setMax(Number(e.target.value))}
              className='w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
              step={allowDecimals ? 'any' : '1'}
              min={allowNegative ? undefined : 0}
            />
          </div>
        </div>
        <div className='flex flex-col items-start justify-start sm:flex-row sm:items-center sm:justify-normal gap-4'>
          <label className='whitespace-nowrap inline-flex items-center gap-2 text-sm cursor-pointer'>
            <input
              type='checkbox'
              checked={allowNegative}
              onChange={e => setAllowNegative(e.target.checked)}
              className='h-4 w-4 accent-blue-500'
            />
            Allow Negative Numbers
          </label>
          <label className='whitespace-nowrap inline-flex items-center gap-2 text-sm cursor-pointer'>
            <input
              type='checkbox'
              checked={allowDecimals}
              onChange={e => setAllowDecimals(e.target.checked)}
              className='h-4 w-4 accent-blue-500'
            />
            Allow Decimals
          </label>

          {allowDecimals && (
            <label className='whitespace-nowrap inline-flex items-center gap-2 text-sm'>
              Significant Figures:
              <input
                type='number'
                min={1}
                max={20}
                value={sigFigs}
                onChange={e => setSigFigs(Number(e.target.value))}
                className='w-16 px-2 py-1 bg-gray-950 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </label>
          )}
        </div>
        <div className='rn-footer'>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'>
            Generate
          </button>
          {result && (
            <div className='flex-grow p-2 bg-green-700 text-white rounded-md text-center break-all'>{result}</div>
          )}
        </div>
      </form>
    </Card>
  )
}

export default RandomNumberGenerator
