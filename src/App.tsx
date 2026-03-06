import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/Layout'
import VideoConverter from './pages/VideoConverter'
import ImageConverter from './pages/ImageConverter'
import UnitConverter from './pages/UnitConverter'
import DataConverter from './pages/DataConverter'
import CurrencyConverter from './pages/CurrencyConverter'
import ConversionLandingPage from './pages/ConversionLandingPage'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<VideoConverter />} />
            <Route path="image-converter" element={<ImageConverter />} />
            <Route path="units" element={<UnitConverter />} />
            <Route path="data-converter" element={<DataConverter />} />
            <Route path="currency-converter" element={<CurrencyConverter />} />
            <Route path="convert/:slug" element={<ConversionLandingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}
