import { Link } from 'react-router-dom'

import RatingStars from '../common/RatingStars'
import { formatPrice } from '../../utils/formatters'


function ProductCard({ product }) {
  const { id, title, price, rating, thumbnail, brand } = product

  return (
    <Link
      to={`/product/${id}`}
      className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {/* Image */}
      <div className="flex h-36 items-center justify-center overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="my-4 border-t border-gray-100" />

      {/* Details */}
      <div className="flex flex-1 flex-col">
        {brand && (
          <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
            {brand}
          </span>
        )}

        <h3
          className="line-clamp-2 text-sm font-semibold text-gray-900"
          title={title}
        >
          {title}
        </h3>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
          <span className="text-lg font-bold text-gray-900">{formatPrice(price)}</span>
          <RatingStars rating={rating} />
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
