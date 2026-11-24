import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
      <Compass className="text-gray-400" size={44} />

      <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>

      <p className="max-w-md text-sm text-gray-600">
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        to="/"
        className="mt-2 rounded-lg bg-[#202c3b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2b3a4d] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Back to products
      </Link>
    </div>
  )
}

export default NotFound
