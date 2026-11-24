const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index)


export const buildPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) return range(1, totalPages)

  if (currentPage <= 4) {
    return [...range(1, 5), 'gap-right', totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'gap-left', ...range(totalPages - 4, totalPages)]
  }

  return [1, 'gap-left', ...range(currentPage - 1, currentPage + 1), 'gap-right', totalPages]
}

export const getTotalPages = (total, pageSize) => Math.max(1, Math.ceil(total / pageSize))
