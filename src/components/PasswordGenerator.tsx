import React, { useState } from 'react'
import Card from './Card'
import './cpnt.css' // Assuming rn-footer and other styles might be here

const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(12)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    let characters = ''
    if (includeUppercase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (includeLowercase) characters += 'abcdefghijklmnopqrstuvwxyz'
    if (includeNumbers) characters += '0123456789'
    if (includeSymbols) characters += '!@#$%^&*()-_=+[]{}|;:,.<>?'

    if (!characters) {
      setResult('Please select at least one character set.')
    } else {
      const password = Array.from({ length }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('')
      setResult(password)
    }
  }

  return (
    <Card title='Password Generator'>
      <form onSubmit={handleGenerate} className='space-y-4'>
        <div>
          <label htmlFor='length' className='block text-sm font-medium p-1'>
            Length:
          </label>
          <input
            type='number'
            id='length'
            name='length'
            value={length}
            onChange={e => {
              const val = parseInt(e.target.value, 10)
              if (e.target.value === '' || isNaN(val)) {
                setLength(4)
              } else if (val < 4) {
                setLength(4)
              } else if (val > 80) {
                setLength(80)
              } else {
                setLength(val)
              }
            }}
            className='w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            min={4}
            max={80}
            required
          />
        </div>

        {/* Updated checkbox section: added w-fit and mx-auto, removed w-full */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 w-fit mx-auto justify-items-start'>
          <label htmlFor='uppercase' className='inline-flex items-center gap-1.5 text-sm cursor-pointer'>
            <input
              type='checkbox'
              id='uppercase'
              name='includeUppercase'
              checked={includeUppercase}
              onChange={e => setIncludeUppercase(e.target.checked)}
              className='h-4 w-4 text-blue-600 border-gray-800 rounded focus:ring-blue-500 accent-blue-600'
            />
            Uppercase
          </label>
          <label htmlFor='lowercase' className='inline-flex items-center gap-1.5 text-sm cursor-pointer'>
            <input
              type='checkbox'
              id='lowercase'
              name='includeLowercase'
              checked={includeLowercase}
              onChange={e => setIncludeLowercase(e.target.checked)}
              className='h-4 w-4 text-blue-600 border-gray-800 rounded focus:ring-blue-500 accent-blue-600'
            />
            Lowercase
          </label>
          <label htmlFor='numbers' className='inline-flex items-center gap-1.5 text-sm cursor-pointer'>
            <input
              type='checkbox'
              id='numbers'
              name='includeNumbers'
              checked={includeNumbers}
              onChange={e => setIncludeNumbers(e.target.checked)}
              className='h-4 w-4 text-blue-600 border-gray-800 rounded focus:ring-blue-500 accent-blue-600'
            />
            Numbers
          </label>
          <label htmlFor='symbols' className='inline-flex items-center gap-1.5 text-sm cursor-pointer'>
            <input
              type='checkbox'
              id='symbols'
              name='includeSymbols'
              checked={includeSymbols}
              onChange={e => setIncludeSymbols(e.target.checked)}
              className='h-4 w-4 text-blue-600 border-gray-800 rounded focus:ring-blue-500 accent-blue-600'
            />
            Symbols
          </label>
        </div>

        <div className='rn-footer'>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'>
            Generate
          </button>
          {result && (
            <div className='flex-grow p-2 bg-green-700 text-white rounded-md text-center break-all ml-4'>{result}</div>
          )}
        </div>
      </form>
    </Card>
  )
}

export default PasswordGenerator
