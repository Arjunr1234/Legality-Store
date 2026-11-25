import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import ProductListing from "../pages/ProductListing";

const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const NotFound = lazy(() => import("../pages/NotFound"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div
      role="status"
      aria-label="Loading page"
      className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
    />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<ProductListing />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
