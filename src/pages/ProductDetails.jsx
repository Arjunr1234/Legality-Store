import { useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import Header from '../components/common/Header'
import ErrorState from '../components/common/ErrorState'
import RatingStars from '../components/common/RatingStars'
import useProductDetails from '../hooks/useProductDetails'
import { formatDate, formatPrice, titleCase } from '../utils/formatters'

const DetailSkeleton = () => (
  <div className="grid animate-pulse gap-8 md:grid-cols-2" aria-hidden="true">
    <div className="h-80 rounded-xl bg-gray-200" />
    <div className="space-y-4">
      <div className="h-7 w-3/4 rounded bg-gray-200" />
      <div className="h-6 w-1/3 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <div className="h-24 rounded bg-gray-200" />
    </div>
  </div>
)

const Meta = ({ label, children }) => (
  <p className="text-sm text-gray-600">
    <span className="font-semibold text-gray-900">{label}:</span> {children}
  </p>
)


function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const { data: product, isPending, isError, error, refetch } = useProductDetails(id)
  const [activeImage, setActiveImage] = useState(0)
  const [searchDraft, setSearchDraft] = useState('')

  const cameFromInsideApp = location.key !== 'default'

  const handleBack = () => {
    if (cameFromInsideApp) navigate(-1)
    else navigate('/')
  }

  const images = product?.images?.length ? product.images : [product?.thumbnail].filter(Boolean)
  const reviews = product?.reviews ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={(value) =>
          navigate(value.trim() ? `/?q=${encodeURIComponent(value.trim())}` : '/')
        }
      />

      <main className="mx-auto max-w-[1440px] px-[5%] py-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {isPending && <DetailSkeleton />}

          {isError && (
            <ErrorState
              error={error}
              onRetry={refetch}
              title={
                error?.status === 404
                  ? 'This product does not exist'
                  : 'We could not load this product'
              }
            />
          )}

          {product && (
            <article className="grid gap-8 md:grid-cols-2">

              {/* Gallery */}
              <div>
                <div className="flex h-80 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                  <img
                    src={images[activeImage]}
                    alt={product.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                {images.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={`View image ${index + 1}`}
                        aria-current={index === activeImage}
                        className={`h-16 w-16 overflow-hidden rounded-lg border p-1 transition ${
                          index === activeImage
                            ? 'border-blue-600 ring-1 ring-blue-600'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  <RatingStars rating={product.rating} size="lg" count={reviews.length} />
                </div>

                <div className="mt-4 space-y-1">
                  <Meta label="Brand">{product.brand ?? 'Not specified'}</Meta>
                  <Meta label="Category">
                    <Link
                      to={`/?category=${encodeURIComponent(product.category)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {titleCase(product.category)}
                    </Link>
                  </Meta>
                  {product.availabilityStatus && (
                    <Meta label="Availability">{product.availabilityStatus}</Meta>
                  )}
                </div>

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <h2 className="mb-2 text-base font-semibold text-gray-900">
                    Description
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {product.description}
                  </p>
                </div>

                {reviews.length > 0 && (
                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <h2 className="mb-3 text-base font-semibold text-gray-900">
                      Reviews
                    </h2>

                    <ul className="space-y-4">
                      {reviews.map((review, index) => (
                        <li key={`${review.reviewerName}-${index}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {review.reviewerName}
                            </span>
                            <RatingStars rating={review.rating} showValue={false} />
                            <span className="text-xs text-gray-400">
                              {formatDate(review.date)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </article>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProductDetails
