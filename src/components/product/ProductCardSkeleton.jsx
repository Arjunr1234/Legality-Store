/** Placeholder tile shown while a page of products loads. */
function ProductCardSkeleton() {
  return (
    <div
      className="h-full animate-pulse rounded-xl border border-gray-200 bg-white p-4"
      aria-hidden="true"
    >
      <div className="h-36 rounded-lg bg-gray-200" />
      <div className="my-4 border-t border-gray-100" />
      <div className="h-3 w-1/3 rounded bg-gray-200" />
      <div className="mt-3 h-4 w-4/5 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
      <div className="mt-4 flex items-center gap-3">
        <div className="h-5 w-16 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
      </div>
    </div>
  )
}

export default ProductCardSkeleton
