import Link from 'next/link'

// links <a> en vez de botones para que Googlebot pueda seguir la paginación,
// un <button onClick> es invisible para el crawler

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Paginación de artículos" className="mt-10 flex justify-center">
      <ol className="flex items-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              href={`/articulos?pagina=${currentPage - 1}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
              aria-label="Página anterior"
            >
              ‹
            </Link>
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-300 cursor-not-allowed"
              aria-disabled="true"
              aria-label="Página anterior"
            >
              ‹
            </span>
          )}
        </li>

        {pages.map((page) => (
          <li key={page}>
            <Link
              href={`/articulos?pagina=${page}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors"
              style={
                page === currentPage
                  ? { backgroundColor: '#F15A2B', borderColor: '#F15A2B', color: '#fff' }
                  : { borderColor: '#d1d5db', color: '#374151' }
              }
              // undefined en vez de false para que React no renderice el atributo
              // en las páginas no activas — con 'false' el atributo igual aparecería en el DOM
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Ir a la página ${page}`}
            >
              {page}
            </Link>
          </li>
        ))}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={`/articulos?pagina=${currentPage + 1}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
              aria-label="Página siguiente"
            >
              ›
            </Link>
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-300 cursor-not-allowed"
              aria-disabled="true"
              aria-label="Página siguiente"
            >
              ›
            </span>
          )}
        </li>
      </ol>
    </nav>
  )
}
