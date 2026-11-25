import { useEffect, useState } from 'react'

import useDebounce from './useDebounce'

const toText = (value) => (value === null ? '' : String(value))

const toPrice = (text) => {
  const price = Number(text)
  return text.trim() === '' || Number.isNaN(price) ? null : price
}

/**
 * The text the user is still typing — the search box and the two price inputs.
 *
 * It is kept out of the URL until typing settles, so the fields stay instant
 * while the app sends one request instead of one per keystroke.
 */
const useFilterDraft = (filters, updateFilters) => {
  const [draft, setDraft] = useState({
    q: filters.q,
    minPrice: toText(filters.minPrice),
    maxPrice: toText(filters.maxPrice),
  })

  const settled = useDebounce(draft, 450)

  useEffect(() => {
    // The draft moved on since this value was captured — "Clear all", say.
    // Writing it back would resurrect the filter the user just removed.
    if (settled !== draft) return

    const q = settled.q.trim()
    const minPrice = toPrice(settled.minPrice)
    const maxPrice = toPrice(settled.maxPrice)

    if (q === filters.q && minPrice === filters.minPrice && maxPrice === filters.maxPrice) return

    updateFilters({ q: q || null, minPrice, maxPrice })
  }, [settled, draft, filters, updateFilters])

  const updateDraft = (changes) => setDraft((current) => ({ ...current, ...changes }))

  const clearDraft = () => setDraft({ q: '', minPrice: '', maxPrice: '' })

  return { draft, updateDraft, clearDraft }
}

export default useFilterDraft
