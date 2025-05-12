import React from 'react'

interface CardProps {
  title: string
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-md mb-8'>
      <div className='bg-gray-800 px-4 py-2 rounded-t-lg'>
        <h2 className='text-lg font-semibold'>{title}</h2>
      </div>
      <div className='p-4'>{children}</div>
    </div>
  )
}

export default Card
