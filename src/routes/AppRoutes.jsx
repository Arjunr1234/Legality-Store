import { Routes, Route } from 'react-router-dom'

import ProductListing from '../pages/ProductListing'
import ProductDetails from '../pages/ProductDetails'
import NotFound from '../pages/NotFound'


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProductListing />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
