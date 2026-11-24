import { Menu, Search, ShoppingCart, SlidersHorizontal, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'


const Header = ({ value = '', onChange, onSubmit, onToggleFilters }) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.(value)
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#202c3b] text-white shadow-md">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-[5%]">

        {/* Logo and mobile filter toggle */}
        <div className="flex items-center gap-3">
          {onToggleFilters && (
            <button
              type="button"
              onClick={onToggleFilters}
              className="rounded-md p-1.5 transition hover:bg-white/10 lg:hidden"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={22} />
            </button>
          )}

          <button
            type="button"
            className="hidden rounded-md p-1.5 transition hover:bg-white/10 lg:inline-flex"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-wider">LEEGALITY</span>
            <span className="text-[10px] tracking-[3px] text-slate-300">STORE</span>
          </Link>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="flex h-11 max-w-[600px] flex-1 items-center gap-3 rounded-lg bg-white px-4 text-slate-500"
        >
          <Search size={19} aria-hidden="true" />

          <input
            type="text"
            placeholder="Search products..."
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            aria-label="Search products"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />

          {value && (
            <button type="button" onClick={() => onChange?.('')} aria-label="Clear search">
              <X size={17} />
            </button>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            className="rounded-md p-1.5 transition hover:bg-white/10"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={22} />
          </button>

          <button
            type="button"
            className="hidden rounded-md p-1.5 transition hover:bg-white/10 sm:inline-flex"
            aria-label="User profile"
          >
            <UserRound size={22} />
          </button>
        </div>

      </div>
    </header>
  )
}

export default Header
