import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <span className="text-8xl font-bold" style={{ color: '#F15A2B' }} aria-hidden="true">
        404
      </span>
      <h1 className="text-2xl font-semibold text-gray-900">
        Página no encontrada
      </h1>
      <p className="max-w-sm text-gray-600">
        El artículo que buscas no existe o fue eliminado.
      </p>
      <Link
        href="/articulos"
        className="rounded-md px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#F15A2B' }}
      >
        Ver todos los artículos
      </Link>
    </main>
  )
}

