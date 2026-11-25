# Leegality Store — Product Listing & Detail

An Amazon-style product catalogue built on the [DummyJSON products API](https://dummyjson.com/docs/products), with combined category / price / brand filtering, search, and pagination.

- **Repository:** https://github.com/Arjunr1234/Legality-Store
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

### Deploying

The app uses `BrowserRouter`, so the host must rewrite unknown paths to `index.html` — otherwise opening `/product/5` directly returns a 404 before React loads.

- **Netlify** — add `public/_redirects` containing `/* /index.html 200`
- **Vercel** — handled automatically for a detected Vite app
- **GitHub Pages** — needs a `404.html` copy of `index.html` and `base: '/<repo-name>/'` in `vite.config.js`

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
│   └── product/
│       ├── FilterSidebar.jsx        # Category / price / brand controls
│       ├── FilterComponents.jsx     # Small presentational parts of the sidebar
│       ├── Products.jsx             # The grid and all its states
│       ├── ProductCard.jsx
│       └── ProductCardSkeleton.jsx
├── hooks/
│   ├── useProductFilters.js         # Filter state, backed by the URL
│   ├── useProducts.js               # List query + filtering/pagination
│   ├── useFilterDraft.js            # Debounced text inputs (search + price)
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

This is the central trade-off in the project. **DummyJSON cannot filter by price or by brand, and it cannot apply a search term and a category at the same time.** Those are genuine API limits, not oversights in the UI — `?minPrice=500` is accepted and silently ignored, still reporting all 194 products.

Filtering a single server-returned page in the browser would be wrong — page 1 would show 2 results out of a claimed 194, page 3 would be empty, and the page count would be meaningless. So `utils/productQuery.js` decides per request how much the server can do:

| Active filters | Strategy | Requests |
| --- | --- | --- |
| None | `/products?limit=12&skip=…` | one small page |
| Category only | `/products/category/{slug}?limit=12&skip=…` | one small page |
| Search only | `/products/search?q=…&limit=12&skip=…` | one small page |
| Any price or brand filter | fetch the scope once with `limit=0`, then filter and paginate in memory | one larger request, cached |
| Search **and** category | same as above | one larger request, cached |

The common paths stay genuinely server-paginated. Only filters the API cannot express fall back to a full-scope fetch, and that fetch is narrowed two ways: `select` trims the payload from 299 KB to 39 KB by requesting only the seven fields a card renders, and the category still goes to the server when one is selected — so *category + price* downloads 16 products, not 194.

Because the page number is deliberately left **out** of the cache key in client mode, everything after that first fetch is free: paging, widening the price range, and adding a brand all cost zero requests. A traced session of 12 user actions issued 9 requests, 7 of them on the first load.

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

Measured on a deliberately bad product id, this is the difference between the "does not exist" message appearing in **0.6s after 1 request** and **8.4s after 4 requests**.

Freshness is set per query rather than globally, because the data ages at different rates:

| Query | `staleTime` | Reasoning |
| --- | --- | --- |
| `useCategories` | `Infinity` (+ `gcTime: Infinity`) | The category list never changes during a session |
| `useProducts` / `useProductDetails` | 5 minutes | Long enough that navigating to a product and back is instant |
| `useBrands` | 1 minute | Derived data, cheap to refresh |

`placeholderData: keepPreviousData` keeps the current page visible while the next loads, so the grid dims instead of collapsing to a spinner and the page doesn't jump.

### 4. Errors are normalised once, at the boundary

The axios response interceptor converts every failure into `{ status, message, isNetworkError, isCanceled }`. UI components render `error.message` and never branch on axios internals. That is also what lets the detail page distinguish a 404 ("This product does not exist") from a transient failure ("We could not load this product").

Cancelled requests are tagged rather than treated as errors, so switching filters quickly aborts the in-flight request instead of letting a stale response overwrite the grid.

### 5. Pending text belongs to the page; applied filters belong to the URL

The search box and the two price inputs can't write to the URL on every keystroke. `useFilterDraft` holds that in-progress text, debounces it by 450ms, and only then writes to the URL.

It lives in the **page**, not in `FilterSidebar`, for a specific reason: on mobile the sidebar is rendered twice — once as the desktop column, once inside the drawer — and two copies each owning a draft and each writing to the URL would fight over it. One owner above them both removes the problem by construction.

### 6. Presentational components take data as props

`Products` receives `products`, `total`, `isPending`, `isError` and callbacks — it does not call `useProducts` itself. The grid is therefore reusable for a category page, recommendations, or search results without modification, and the page component remains the only place that wires data to view.

---

## Performance notes

The detail page and the 404 page are loaded with `React.lazy`; the listing page is deliberately **not**, since it is where nearly every visit starts and splitting it would add a round trip before first paint.

Worth being honest about the result, because it is the interesting part:

| | Size | Gzipped |
| --- | --- | --- |
| Main bundle | 378.4 KB | 122.5 KB |
| `ProductDetails` chunk | 4.6 KB | 1.7 KB |
| `NotFound` chunk | 1.0 KB | 0.6 KB |

Splitting both pages out reduced the initial download by **0.31 KB gzipped**. Almost everything in the bundle is React, React Router, TanStack Query and axios — shared by every route — so route-level splitting has very little to take away. Code splitting earns its keep when one route pulls in a heavy dependency the others don't; this app has no such route. The split is kept because it costs nothing and the boundary is already in place if the detail page later grows.

---

## Assumptions

1. **Price and brand filtering are client-side by necessity.** DummyJSON exposes no query parameters for either. See the table above for exactly when this applies.
2. **92 of the 194 products have no `brand` field** (groceries, home-decoration, kitchen-accessories, sports-accessories, tops, womens-dresses, womens-jewellery). Those products are excluded from the brand list and from results when a brand filter is active, since the API gives nothing to match on. The detail page shows "Not specified" for them. The remaining products yield 63 distinct brands.
3. **The brand list is scoped to the selected category.** Showing all 63 catalogue brands while the user is browsing Beauty would be noise. A brand-list search box appears once there are more than 8.
4. **Price filters auto-apply, debounced by 450ms.** The mockup shows an "Apply" button, but the written rule — "changing a filter should update the product list immediately" — takes precedence. Debouncing avoids a request per keystroke while still feeling immediate.
5. **Brands are multi-select.** The brief permits single or multi; multi-select is more useful and matches the checkboxes in the mockup.
6. **Page size is 12.** Unspecified in the brief; 12 divides evenly into the 2-, 3- and 4-column breakpoints.
7. **`/products/categories` returns `{slug, name, url}` objects** with names already title-cased, so the hook only narrows them to the two fields the sidebar needs.
8. **When search and category are combined, the search wins the endpoint** and the category is applied in the browser. It cannot be the other way round: the API's search matches descriptions — 77 of the 90 results for "to" have no "to" in their title — and the app doesn't download descriptions, so a browser-side search could not reproduce those matches. Category matching is exact, so that is the one safe to move.
9. **Reviews are shown on the detail page.** Not in the written requirements, but present in the mockup and in the API response.
10. **Search is a bonus.** The header search box existed in the starter code; it's wired to `/products/search` and composes with the other filters.

---

## Known limitations

- Brand filtering cannot include products the API leaves unbranded.
- A search term combined with a category is resolved client-side, so a category with no matches correctly returns zero results rather than falling back to an unfiltered search.
- The cart and profile buttons in the header are decorative — out of scope for this brief.
- In development you will see three cancelled requests on first load. That is React StrictMode mounting the tree twice and TanStack Query aborting the first set; the production build issues none.

---

## Improvements with more time

1. **Automated tests.** The filtering and pagination logic is already pure and isolated for this purpose; Vitest unit tests for `productQuery.js` / `pagination.js` plus React Testing Library coverage of the filter-and-back flow would be the first addition.
2. **Prefetch the detail page on card hover** — both the lazy chunk and the product data, via `queryClient.prefetchQuery`, so the page is warm before the click lands.
3. **Move price/brand filtering server-side** against a real backend, removing the full-scope fetch entirely.
4. **Virtualised or infinite-scroll listing**, which would matter against a catalogue of realistic size.
5. **A URL-state schema** (e.g. Zod) to validate and coerce query parameters, instead of the hand-written parsers in `useProductFilters`.
6. **Accessibility pass** — focus trapping in the mobile filter drawer, and a live region announcing result counts on filter change.
7. **Enable `react/jsx-no-undef`** in the ESLint config; the base rules don't check JSX element names, so a missing component import surfaces only at runtime.
8. **TypeScript**, which would have caught the import-path and prop-shape mistakes in the starter code at compile time.
