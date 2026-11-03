import React from 'react'
import { Route , Routes , Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Leaves from './pages/Leaves'
import Manage from './pages/Manage'
import LandingPage from './pages/LandingPage'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Navbar />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/manage" element={<Manage />} />
      </Route>
    </Routes>
  )
}

export default App
