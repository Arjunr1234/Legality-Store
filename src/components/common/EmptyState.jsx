import { PackageSearch } from 'lucide-react'

function EmptyState({
  title = 'No products found',
  message = 'Try adjusting or clearing your filters.',
  onReset,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <PackageSearch className="text-gray-400" size={36} />

      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="max-w-md text-sm text-gray-500">{message}</p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

export default EmptyState
