import React, { useState } from 'react'
import axios from 'axios'
import Card from './Card'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import type { UserMinimal, UserExpanded, User, UserType } from '../types/randomUser' //, RandomUserApiResponse
import { GENDERS, NATIONALITIES, USER_COUNTS, FIELD_MAP } from '../constants/randomUser'
import { parseUserData, getUserRawData } from '../utils/parseUserData'
import { FaSpinner } from 'react-icons/fa'

const JsonViewer = <T extends object>({
  data,
  raw,
  format,
  userIdentifier,
}: {
  data: T
  raw?: string | null
  format: string
  userIdentifier?: number
}) => {
  const userRaw = userIdentifier !== undefined ? getUserRawData(format, raw ?? null, userIdentifier) : raw
  return (
    <pre className='bg-gray-900 text-gray-100 rounded p-3 overflow-x-auto text-xs'>
      {format === 'json' || format === 'pretty' ? JSON.stringify(data, null, format === 'pretty' ? 2 : 0) : userRaw}
    </pre>
  )
}

const RandomUsers: React.FC = () => {
  const [numUsers, setNumUsers] = useState<number>(5)
  const [userCountInput, setUserCountInput] = useState<string>('5')
  const [gender, setGender] = useState<string>('')
  const [nat, setNat] = useState<string>('')
  const [users, setUsers] = useState<Array<UserMinimal | UserExpanded | User>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [userType, setUserType] = useState<UserType>('minimal')

  const [format, setFormat] = useState<'json' | 'pretty' | 'csv' | 'yaml' | 'xml'>('json')
  const [rawData, setRawData] = useState<string | null>(null)

  const copyToClipboard = useCopyToClipboard()

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    setUsers([])
    setRawData(null)
    try {
      const params: Record<string, string | number> = { results: numUsers, format }
      if (FIELD_MAP[userType]) params.inc = FIELD_MAP[userType]
      if (userType !== 'minimal') {
        if (gender) params.gender = gender
        if (nat) params.nat = nat
      }
      const responseType = format === 'json' || format === 'pretty' ? 'json' : 'text'
      const res = await axios.get('https://randomuser.me/api/', { params, responseType })
      if (format === 'json' || format === 'pretty') {
        setUsers(res.data.results.map((u: User | UserMinimal | UserExpanded) => u as UserMinimal | UserExpanded | User))
        setRawData(JSON.stringify(res.data, null, format === 'pretty' ? 2 : 0))
      } else {
        setRawData(res.data)
        const parsed = await parseUserData(res.data, format)
        setUsers(parsed)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to fetch users.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUsers = () => {
    if (rawData) {
      copyToClipboard(rawData, 'Users Data')
    } else {
      copyToClipboard(JSON.stringify(users, null, 2), 'Users JSON')
    }
  }

  const handleUserCountChange = (val: number) => {
    setNumUsers(val)
    setUserCountInput(val.toString())
  }

  return (
    <Card title='Random User Generator'>
      <div className='flex flex-col sm:flex-row sm:items-end gap-4 mb-4'>
        <div className='flex flex-wrap gap-4 items-end flex-1'>
          {/* Number of Users */}
          <div className='flex flex-col'>
            <label className='block text-xs font-medium mb-1'>Number of Users</label>
            <div className='flex gap-2'>
              <Combobox value={numUsers} onChange={handleUserCountChange}>
                <div className='relative'>
                  <ComboboxInput
                    className='w-20 px-2 py-1 rounded border border-gray-400 bg-gray-800 text-white h-9'
                    value={userCountInput}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      setUserCountInput(val)
                      const n = Number(val)
                      if (!isNaN(n) && n > 0) setNumUsers(n)
                    }}
                    onBlur={() => {
                      const n = Number(userCountInput)
                      if (!n || n < 1) {
                        setNumUsers(USER_COUNTS[0])
                        setUserCountInput(USER_COUNTS[0].toString())
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const n = Number(userCountInput)
                        if (!isNaN(n) && n > 0) {
                          setNumUsers(n)
                        }
                      }
                    }}
                    displayValue={() => userCountInput}
                    // displayValue is optional, but can help with custom values
                  />
                  <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
                    <ChevronUpDownIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                  </ComboboxButton>
                  <ComboboxOptions className='absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded shadow-lg max-h-48 overflow-auto focus:outline-none'>
                    {USER_COUNTS.map(count => (
                      <ComboboxOption
                        key={count}
                        value={count}
                        className={({ selected }) =>
                          `cursor-pointer select-none px-4 py-2 ${
                            selected ? 'bg-gray-700 text-white' : 'text-gray-100'
                          }`
                        }>
                        {count}
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </div>
              </Combobox>
            </div>
          </div>
          {/* User Data Type */}
          <div className='flex flex-col'>
            <label className='block text-xs font-medium mb-1'>User Data</label>
            <select
              value={userType}
              onChange={e => {
                setUserType(e.target.value as UserType)
                setGender('')
                setNat('')
              }}
              className='px-2 py-1 rounded border border-gray-400 bg-gray-800 text-white h-9'>
              <option value='minimal'>Minimal</option>
              <option value='expanded'>Expanded</option>
              <option value='all'>All</option>
            </select>
          </div>
          {/* Gender (only for expanded/all) */}
          {(userType === 'expanded' || userType === 'all') && (
            <div className='flex flex-col'>
              <label className='block text-xs font-medium mb-1'>Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className='px-2 py-1 rounded border border-gray-400 bg-gray-800 text-white h-9'>
                {GENDERS.map(g => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Nationality (only for expanded/all) */}
          {(userType === 'expanded' || userType === 'all') && (
            <div className='flex flex-col'>
              <label className='block text-xs font-medium mb-1'>Nationality</label>
              <select
                value={nat}
                onChange={e => setNat(e.target.value)}
                className='px-2 py-1 rounded border border-gray-400 bg-gray-800 text-white h-9'>
                {NATIONALITIES.map(n => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <select
            value={format}
            onChange={e => setFormat(e.target.value as 'json' | 'pretty' | 'csv' | 'yaml' | 'xml')}
            className='px-2 py-1 rounded border border-gray-400 bg-gray-800 text-white h-9'>
            <option value='json'>JSON</option>
            <option value='pretty'>Pretty JSON</option>
            <option value='csv'>CSV</option>
            <option value='yaml'>YAML</option>
            <option value='xml'>XML</option>
          </select>
          {/* Get Users Button */}
          <div className='flex flex-col justify-end'>
            <button
              onClick={fetchUsers}
              className='px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow h-9 flex items-center justify-center'
              disabled={loading}>
              {loading ? <FaSpinner className='animate-spin mr-2' /> : null}
              {loading ? 'Loading...' : 'Get Users'}
            </button>
          </div>
        </div>
        {/* Copy Users Button */}
        <div className='flex-1 flex justify-end items-end'>
          <button
            onClick={handleCopyUsers}
            className='px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold shadow h-9'
            disabled={!users.length}>
            Copy Users
          </button>
        </div>
      </div>

      {error && <div className='text-red-400 mb-2'>{error}</div>}

      {loading ? (
        <div className='flex justify-center py-8'>
          <FaSpinner className='animate-spin text-4xl text-blue-400' />
        </div>
      ) : (
        <div className='max-h-96 overflow-y-auto space-y-2'>
          {users.map((user, idx) => {
            if (userType === 'minimal') {
              const u = user as UserMinimal
              return (
                <div key={u.login?.uuid ?? idx} className='bg-gray-800 rounded shadow p-2'>
                  <button
                    className='flex items-center w-full text-left gap-3 focus:outline-none'
                    onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}>
                    {u.picture?.thumbnail && (
                      <img
                        src={u.picture.thumbnail}
                        alt='User thumbnail'
                        className='rounded-full border border-gray-600 w-12 h-12'
                      />
                    )}
                    <div>
                      <div className='font-semibold text-white'>
                        {u.name?.title} {u.name?.first} {u.name?.last}
                      </div>
                      <div className='text-xs text-gray-300'>{u.email}</div>
                      <div className='text-xs text-gray-400'>
                        Username: {u.login?.username} | Password: {u.login?.password}
                      </div>
                    </div>
                    <span className='ml-auto text-blue-300 text-xs'>
                      {expandedIndex === idx ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </button>
                  {expandedIndex === idx && (
                    <div className='mt-2'>
                      <JsonViewer data={u} raw={rawData} format={format} userIdentifier={idx} />
                    </div>
                  )}
                </div>
              )
            } else if (userType === 'expanded') {
              const u = user as UserExpanded
              return (
                <div key={u.login?.uuid ?? idx} className='bg-gray-800 rounded shadow p-2'>
                  <button
                    className='flex items-center w-full text-left gap-3 focus:outline-none'
                    onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}>
                    {u.picture?.thumbnail && (
                      <img
                        src={u.picture.thumbnail}
                        alt='User thumbnail'
                        className='rounded-full border border-gray-600 w-12 h-12'
                      />
                    )}
                    <div>
                      <div className='font-semibold text-white'>
                        {u.name?.title} {u.name?.first} {u.name?.last}
                      </div>
                      <div className='text-xs text-gray-300'>
                        {u.email} &middot; {u.location?.country}
                      </div>
                      <div className='text-xs text-gray-400'>
                        Username: {u.login?.username} | Password: {u.login?.password}
                      </div>
                    </div>
                    <span className='ml-auto text-blue-300 text-xs'>
                      {expandedIndex === idx ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </button>
                  {expandedIndex === idx && (
                    <div className='mt-2'>
                      <JsonViewer data={u} raw={rawData} format={format} userIdentifier={idx} />
                    </div>
                  )}
                </div>
              )
            } else {
              const u = user as User
              return (
                <div key={u.login?.uuid ?? idx} className='bg-gray-800 rounded shadow p-2'>
                  <button
                    className='flex items-center w-full text-left gap-3 focus:outline-none'
                    onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}>
                    {u.picture?.thumbnail && (
                      <img
                        src={u.picture.thumbnail}
                        alt='User thumbnail'
                        className='rounded-full border border-gray-600 w-12 h-12'
                      />
                    )}
                    <div>
                      <div className='font-semibold text-white'>
                        {u.name?.title} {u.name?.first} {u.name?.last}
                      </div>
                      <div className='text-xs text-gray-300'>{u.email}</div>
                    </div>
                    <span className='ml-auto text-blue-300 text-xs'>
                      {expandedIndex === idx ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </button>
                  {expandedIndex === idx && (
                    <div className='mt-2'>
                      <JsonViewer data={u} raw={rawData} format={format} userIdentifier={idx} />
                    </div>
                  )}
                </div>
              )
            }
          })}
          {!users.length && !loading && (
            <div className='text-center text-gray-400 py-8'>
              No users loaded. Click "Get Users" to fetch random users.
            </div>
          )}
        </div>
      )}
      <div className='mt-6 text-xs text-gray-400 text-center'>
        Data powered by{' '}
        <a
          href='https://randomuser.me/'
          target='_blank'
          rel='noopener noreferrer'
          className='underline hover:text-blue-300'>
          randomuser.me
        </a>
      </div>
    </Card>
  )
}

export default RandomUsers
