import { formatRating } from '../../utils/formatters'

const STARS = [0, 1, 2, 3, 4]


function RatingStars({ rating = 0, size = 'sm', showValue = true, count }) {
  const safeRating = Math.min(5, Math.max(0, Number(rating) || 0))
  const fillPercent = (safeRating / 5) * 100

  const sizeClass = size === 'lg' ? 'text-xl' : 'text-sm'

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`relative inline-block leading-none ${sizeClass}`}
        role="img"
        aria-label={`Rated ${formatRating(safeRating)} out of 5`}
      >
        <span className="flex whitespace-nowrap text-gray-300" aria-hidden="true">
          {STARS.map((index) => (
            <span key={index}>★</span>
          ))}
        </span>

        <span
          className="absolute inset-y-0 left-0 flex overflow-hidden whitespace-nowrap text-amber-400"
          style={{ width: `${fillPercent}%` }}
          aria-hidden="true"
        >
          {STARS.map((index) => (
            <span key={index}>★</span>
          ))}
        </span>
      </span>

      {showValue && (
        <span className="text-xs text-gray-600">
          ({formatRating(safeRating)}
          {typeof count === 'number' ? ` · ${count}` : ''})
        </span>
      )}
    </span>
  )
}

export default RatingStars
