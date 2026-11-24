# Leegality Store — Product Listing & Detail

An Amazon-style product catalogue built on the [DummyJSON products API](https://dummyjson.com/docs/products), with combined category / price / brand filtering, search, and pagination.

- **Repository:** _add your GitHub link_
- **Live demo:** _add your deploy link_

---

## Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | React 19 (function components + hooks) | Required by the brief |
| Build | Vite 8 | Fast dev server, zero-config env handling |
| Routing | React Router 7 | Required by the brief |
| Server state | TanStack Query 5 | Caching, de-duplication, request cancellation and loading/error states without hand-rolled `useEffect` fetching |
| Styling | Tailwind CSS 4 | Utility-first, no component library — keeps the bundle small, as the brief asks |
| HTTP | Axios | One configured instance with a response interceptor for error normalisation |
| Icons | lucide-react | Tree-shakeable SVG icons only, not a UI kit |

---

## Setup

Requires Node 18+.

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # production build to dist/
npm run preview      # serve the production build
npm run lint         # ESLint
```

### Environment

The API base URL is configurable but **optional** — the app falls back to the public DummyJSON host, so a fresh clone runs with no setup.

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=https://dummyjson.com
```

---

## Project structure

```
src/
├── api/
│   ├── apiEndPoints.js              # Every endpoint path, in one place
│   ├── axiosInstance.js             # Axios instance + error normalisation
│   ├── apiServices.js               # Thin transport wrapper
│   └── repositories/
│       └── productRepository.js     # All product data access
├── components/
│   ├── common/                      # Header, Pagination, RatingStars,
│   │                                # ErrorState, EmptyState
│   └── product/                     # ProductCard, ProductCardSkeleton,
│                                    # FilterSidebar, Products (grid)
├── hooks/
│   ├── useProductFilters.js         # Filter state, backed by the URL
│   ├── useProducts.js               # List query + filtering/pagination
│   ├── useProductDetails.js         # Single product query
│   ├── useCategories.js             # /products/categories
│   ├── useBrands.js                 # Unique brands, derived from products
│   └── useDebounce.js
├── pages/
│   ├── ProductListing.jsx           # Screen 1
│   ├── ProductDetails.jsx           # Screen 2
│   └── NotFound.jsx
├── routes/AppRoutes.jsx
└── utils/
    ├── productQuery.js              # Server-vs-client filtering strategy
    ├── pagination.js                # Page-window algorithm
    ├── formatters.js
    └── constants.js
```

The dependency direction is strictly one-way:

```
pages → components → hooks → repositories → apiService → axios
```

No component imports axios or knows an endpoint string. Swapping DummyJSON for a real backend means editing `productRepository.js` and nothing else.

---

## Requirements coverage

**Product Listing Page**
- Filters on the left, product grid on the right, pagination at the bottom
- Cards show image, title, price and rating; the whole card links to the detail page
- Responsive: 1→2→3→4 columns, with the sidebar becoming a slide-over drawer under `lg`

**Filters (all mandatory ones)**
- **Category** — fetched dynamically from `/products/categories`
- **Price range** — min and max inputs
- **Brand** — unique brands derived from the fetched products, multi-select
- Filters combine; the list updates immediately; pagination resets on any filter change
- Loading skeletons and error states with retry at every level (grid, categories, brands)

**Product Detail Page**
- Image gallery, name, price, rating, description, brand, category, plus reviews
- Route is `/product/:id`
- Back button returns to the listing **with the previous filters still applied**

**API usage** — `/products`, `/products/search`, `/products/categories`, `/products/category/{slug}`, `/products/{id}`, paginated with `limit` and `skip`.

---

## Architectural decisions

### 1. Filter state lives in the URL, not in React state

`useProductFilters` reads and writes `useSearchParams` rather than holding `useState`:

```
/?q=watch&category=mens-watches&brands=Rolex,Casio&minPrice=50&maxPrice=500&page=2
```

This was chosen primarily because the brief requires filters to survive a round trip to a product page and back. With the URL as the source of truth, the browser's own history restores them — no context provider, no `sessionStorage`, no serialisation of state into navigation payloads.

It also buys three things for free: filtered views are shareable and bookmarkable, a refresh preserves the view, and the sidebar and grid can never disagree about what is applied, because they read the same single source.

Every write uses `replace: true`, so typing in the search box doesn't push a history entry per keystroke and the listing page keeps a single entry. The Back button on a product page therefore returns to the exact filtered URL the user left, which is what the brief asks for.

### 2. Server-side pagination, with a deliberate client-side fallback

This is the central trade-off in the project. **DummyJSON cannot filter by price or by brand, and it cannot apply a search term and a category at the same time.** Those are genuine API limits, not oversights in the UI.

Filtering a single server-returned page in the browser would be wrong — page 1 would show "4 results" out of a claimed 194, and the page count would be meaningless. So `utils/productQuery.js` decides per request how much the server can do:

| Active filters | Strategy | Requests |
| --- | --- | --- |
| None | `/products?limit=12&skip=…` | one small page |
| Category only | `/products/category/{slug}?limit=12&skip=…` | one small page |
| Search only | `/products/search?q=…&limit=12&skip=…` | one small page |
| Any price or brand filter | fetch the scope once with `limit=0`, then filter and paginate in memory | one larger request, cached |
| Search **and** category | same as above | one larger request, cached |

The common paths stay genuinely server-paginated. Only the filters the API cannot express fall back to a full-scope fetch — and because the catalogue is 194 products and the response is trimmed with `select`, that request is small and TanStack Query caches it, so changing pages or toggling a brand afterwards costs no network at all.

`buildProductQuery`, `applyClientFilters` and `paginate` are pure functions, so this logic is testable without mounting a component.

### 3. TanStack Query owns caching and retries — the API layer does not

The original `ApiService` had its own exponential-backoff retry loop while the `QueryClient` was also configured with `retry: 2`. Those multiply: one genuinely failing request becomes **nine** network calls and the error state takes ~10 seconds to appear, which reads to a user as "it isn't loading" rather than "it failed".

Retries now live in exactly one place, and they're smarter: a 4xx is never retried, because a 404 or a 400 cannot succeed on a second attempt.

```js
retry: (failureCount, error) => {
  const status = error?.status
  if (status && status >= 400 && status < 500) return false
  return failureCount < 2
}
```

`placeholderData: keepPreviousData` keeps the current page visible while the next loads, so the grid dims instead of collapsing to a spinner and the page doesn't jump.

### 4. Errors are normalised once, at the boundary

The axios response interceptor converts every failure into `{ status, message, isNetworkError, isCanceled }`. UI components render `error.message` and never branch on axios internals. That is also what lets the detail page distinguish a 404 ("This product does not exist") from a transient failure ("We could not load this product").

### 5. Presentational components take data as props

`Products` receives `products`, `total`, `isPending`, `isError` and callbacks — it does not call `useProducts` itself. The grid is therefore reusable for a category page, recommendations, or search results without modification, and the page component remains the only place that wires data to view.

---

## Assumptions

1. **Price and brand filtering are client-side by necessity.** DummyJSON exposes no query parameters for either. See the table above for exactly when this applies.
2. **92 of the 194 products have no `brand` field** (groceries, home-decoration, tops, womens-dresses, womens-jewellery, kitchen-accessories, sports-accessories). Those products are excluded from the brand list and from results when a brand filter is active, since the API gives nothing to match on. The detail page shows "Not specified" for them.
3. **The brand list is scoped to the selected category.** Showing all ~100 catalogue brands when the user is browsing Beauty would be noise. A brand-list search box appears once there are more than 8.
4. **Price filters auto-apply, debounced by 450ms.** The mockup shows an "Apply" button, but the written rule — "changing a filter should update the product list immediately" — takes precedence. Debouncing avoids a request per keystroke while still feeling immediate.
5. **Brands are multi-select.** The brief permits single or multi; multi-select is more useful and matches the checkboxes in the mockup.
6. **Page size is 12.** Unspecified in the brief; 12 divides evenly into the 2-, 3- and 4-column breakpoints.
7. **`/products/categories` returns objects** (`{slug, name, url}`) in the current API version. The hook also accepts the older plain-string shape, so the app won't break if the API reverts.
8. **Reviews are shown on the detail page.** Not in the written requirements, but present in the mockup and in the API response.
9. **Search is a bonus.** The header search box existed in the starter code; it's wired to `/products/search` and composes with the other filters.

---

## Known limitations

- A search term combined with a category is resolved client-side, so a category with no matches correctly returns zero results rather than falling back to an unfiltered search.
- Brand filtering cannot include products the API leaves unbranded.
- The cart and profile buttons in the header are decorative — out of scope for this brief.

---

## Improvements with more time

1. **Automated tests.** The filtering and pagination logic is already pure and isolated for this purpose; Vitest unit tests for `productQuery.js` / `pagination.js` plus React Testing Library coverage of the filter-and-back flow would be the first addition.
2. **Virtualised or infinite-scroll listing**, which would matter against a catalogue of realistic size.
3. **Prefetch the detail page on card hover** via `queryClient.prefetchQuery` — the data is usually warm before the click lands.
4. **Move price/brand filtering server-side** against a real backend, removing the full-scope fetch entirely.
5. **A URL-state schema** (e.g. Zod) to validate and coerce query parameters, instead of the hand-written parsers in `useProductFilters`.
6. **Accessibility pass** — focus trapping in the mobile filter drawer, and a live region announcing result counts on filter change.
7. **Skeleton-to-content transitions** and image `blurhash` placeholders to reduce layout shift further.
8. **TypeScript**, which would have caught the import-path and prop-shape mistakes in the starter code at compile time.
