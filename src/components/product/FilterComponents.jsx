export const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

export const Section = ({ title, children }) => (
  <section>
    <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
    {children}
  </section>
)

export const OptionList = ({ children }) => (
  <div className="max-h-56 space-y-1 overflow-y-auto pr-1">{children}</div>
)

export const Option = ({ type, name, label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-gray-700 hover:bg-gray-50">
    <input
      type={type}
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 accent-blue-600"
    />
    <span className="truncate" title={label}>
      {label}
    </span>
  </label>
)

export const Loading = ({ rows }) => (
  <div className="space-y-2" aria-hidden="true">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
    ))}
  </div>
)

export const LoadFailed = ({ label, onRetry }) => (
  <p className="text-xs text-red-600">
    Could not load {label}.
    <button type="button" onClick={onRetry} className="ml-1 font-medium underline">
      Retry
    </button>
  </p>
)