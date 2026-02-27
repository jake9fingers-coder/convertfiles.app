import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import VideoConverter from './pages/VideoConverter'
import ImageConverter from './pages/ImageConverter'
import RemoveBackground from './pages/RemoveBackground'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<VideoConverter />} />
          <Route path="image-converter" element={<ImageConverter />} />
          <Route path="remove-background" element={<RemoveBackground />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
