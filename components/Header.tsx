import Link from 'next/link'

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      {/* salta directo al contenido principal — solo visible cuando el usuario navega con teclado */}
      <a href="#main-content" className="skip-link">
        Ir al contenido principal
      </a>
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
        aria-label="Navegación principal"
      >
        <Link
          href="/articulos"
          className="text-xl font-bold tracking-tight"
          style={{ color: '#F15A2B' }}
        >
          Patitas
        </Link>
        <Link
          href="/articulos"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Artículos
        </Link>
      </nav>
    </header>
  )
}
