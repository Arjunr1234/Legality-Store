import { AlertTriangle, RotateCw } from 'lucide-react'


function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center"
    >
      <AlertTriangle className="text-red-500" size={32} />

      <h2 className="text-base font-semibold text-red-900">{title}</h2>

      <p className="max-w-md text-sm text-red-700">
        {error?.message ?? 'An unexpected error occurred. Please try again.'}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        >
          <RotateCw size={16} />
          Try again
        </button>
      )}
    </div>
  )
}

export default ErrorState
