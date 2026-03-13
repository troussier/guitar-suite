import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FretboardTrainer from './pages/FretboardTrainer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="fretboard" element={<FretboardTrainer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
