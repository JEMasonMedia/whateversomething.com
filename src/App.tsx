import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import ColorPicker from './components/ColorPicker'
import PasswordGenerator from './components/PasswordGenerator'
import RandomNumberGenerator from './components/RandomNumberGenerator'

function App() {
  return (
    <div className='container mx-auto my-8 max-w-4xl'>
      <h1 className='text-3xl font-bold text-center mb-8'>Whateversomething.com</h1>
      <p className='text-center text-gray-400 mb-8'>
        A simple utility app for generating various useful things for developers and regular folk.
      </p>
      <ColorPicker />
      <PasswordGenerator />
      <RandomNumberGenerator />

      <ToastContainer
        position='top-right'
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark' // Or "light", "colored"
      />
    </div>
  )
}

export default App
