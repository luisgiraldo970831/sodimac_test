// necesita 'use client' porque usa localStorage y maneja foco —
// esas APIs no existen en el servidor donde corre Next.js
'use client'

import { useState, useEffect, useRef } from 'react'

const SECTIONS = [
  {
    title: 'Stack Tecnológico',
    content: (
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 pr-4 text-left font-semibold text-gray-700">Librería</th>
            <th className="py-2 pr-4 text-left font-semibold text-gray-700">Versión</th>
            <th className="py-2 text-left font-semibold text-gray-700">Por qué</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[
            ['Next.js', '16.2.1', 'App Router, SSR nativo, generateMetadata API'],
            ['React', '19', 'Server Components, sin overhead de hidratación innecesaria'],
            ['TypeScript', '5', 'Tipado estático: interfaces Article, PaginatedResult'],
            ['Tailwind CSS', '4', 'Utility-first, cero CSS muerto, PostCSS nativo'],
          ].map(([lib, ver, why]) => (
            <tr key={lib}>
              <td className="py-2 pr-4 font-medium text-gray-800">{lib}</td>
              <td className="py-2 pr-4 text-gray-500">{ver}</td>
              <td className="py-2 text-gray-600">{why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    title: 'Estrategia de Rendering (SSR)',
    content: (
      <div className="space-y-3 text-sm text-gray-700">
        <p>Todas las páginas de contenido usan <strong>Server-Side Rendering real</strong> forzado con:</p>
        <pre className="rounded-lg bg-gray-100 p-3 text-xs overflow-x-auto">
          {'export const dynamic = \'force-dynamic\''}
        </pre>
        <p>Esto garantiza que en cada request el servidor genera el HTML completo — incluyendo <code className="bg-gray-100 px-1 rounded">&lt;title&gt;</code>, <code className="bg-gray-100 px-1 rounded">&lt;meta description&gt;</code>, <code className="bg-gray-100 px-1 rounded">&lt;h1&gt;</code> y JSON-LD — antes de enviarlo al browser.</p>
        <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
          <p className="font-semibold text-orange-800 mb-1">Flujo de rendering:</p>
          <p className="font-mono text-xs text-orange-700">
            Request → Next.js Server → getArticles() → generateMetadata() → HTML completo → Browser
          </p>
        </div>
        <p>Googlebot recibe el HTML íntegro sin necesidad de ejecutar JavaScript.</p>
      </div>
    ),
  },
  {
    title: 'Arquitectura del Proyecto',
    content: (
      <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-4 overflow-x-auto leading-relaxed">
{`data/
  articles.json          → 8 artículos sobre mascotas (perros, gatos, salud, etc.)
lib/
  articles.ts            → getArticles(), getArticleBySlug(), getAllSlugs()
components/
  Header.tsx             → Navbar con marca (Server Component)
  ArticleCard.tsx        → Tarjeta con next/image (Server Component)
  Pagination.tsx         → Links <a> crawleables (Server Component)
  JsonLd.tsx             → Inyecta JSON-LD en <head>
  ArchModal.tsx          → Este modal (Client Component)
app/
  layout.tsx             → Metadata global + title.template
  page.tsx               → redirect('/articulos')
  not-found.tsx          → 404 personalizado + noindex automático
  robots.ts              → Genera /robots.txt
  sitemap.ts             → Genera /sitemap.xml
  articulos/
    page.tsx             → Listado SSR + paginación ?pagina=N
  articulos/[slug]/
    page.tsx             → Detalle SSR + generateMetadata + JSON-LD`}
      </pre>
    ),
  },
  {
    title: 'SEO: 10 decisiones técnicas',
    content: (
      <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
        {[
          ['generateMetadata', 'Cada artículo genera su propio <title> y <meta description> dinámicamente en servidor.'],
          ['title.template', 'Root layout define "%s | Patitas" para que todas las páginas tengan sufijo de marca.'],
          ['URLs semánticas', '/articulos/guia-cuidado-perros en lugar de /articulos?id=1.'],
          ['HTML semántico', 'Un <h1> por página, <h2> en secciones, <article>, <main>, <time>, <figure>.'],
          ['JSON-LD (schema.org/Article)', 'Datos estructurados en detalle para rich results en Google.'],
          ['next/image', 'Genera srcset automático, lazy loading y optimización de LCP.'],
          ['Manejo de 404 real', 'notFound() retorna HTTP 404 real — no soft 404 con código 200.'],
          ['robots.txt', 'Generado dinámicamente en app/robots.ts vía MetadataRoute.Robots.'],
          ['sitemap.xml', '9 URLs (listado + 8 artículos) con priority y changeFrequency.'],
          ['Accesibilidad', 'aria-label en navs, aria-current en paginación, alt en imágenes, foco manejado.'],
        ].map(([key, val]) => (
          <li key={key}>
            <strong className="text-gray-900">{key}:</strong> {val}
          </li>
        ))}
      </ol>
    ),
  },
  {
    title: 'Cómo navegar la app',
    content: (
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 pr-6 text-left font-semibold text-gray-700">Ruta</th>
            <th className="py-2 text-left font-semibold text-gray-700">Descripción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[
            ['/', 'Redirect automático a /articulos'],
            ['/articulos', 'Listado paginado (3 artículos por página)'],
            ['/articulos?pagina=2', 'Segunda página del listado'],
            ['/articulos/[slug]', 'Detalle del artículo — ej: /articulos/guia-cuidado-perros'],
            ['/robots.txt', 'Directivas para crawlers'],
            ['/sitemap.xml', 'Mapa del sitio para Google'],
          ].map(([route, desc]) => (
            <tr key={route}>
              <td className="py-2 pr-6 font-mono text-xs text-orange-700">{route}</td>
              <td className="py-2 text-gray-600">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
]

export default function ArchModal() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // localStorage para que no vuelva a abrirse si el usuario ya lo vio
    if (!localStorage.getItem('arch-modal-seen')) {
      setOpen(true)
    }
  }, [])

  function close() {
    localStorage.setItem('arch-modal-seen', 'true')
    setOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    // movemos el foco al botón de cerrar cuando el modal abre,
    // si no, el teclado se queda atrapado fuera del dialog
    closeRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    // sin el cleanup se acumularían listeners en cada apertura
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Ver decisiones de arquitectura"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg text-xl font-bold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: '#F15A2B' }}
      >
        ℹ
      </button>

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={close}
            className="fixed inset-0 z-50 bg-black/50"
          />
          {/* aria-modal le dice al screen reader que ignore lo que hay detrás del overlay,
              sin esto sigue leyendo el resto de la página con el modal abierto.
              aria-labelledby lo conecta al <h2> para que el dialog tenga nombre accesible */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="arch-modal-title"
            className="fixed inset-0 z-50 m-auto flex h-fit max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            style={{ top: '50%', transform: 'translateY(-50%)', left: 0, right: 0 }}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 id="arch-modal-title" className="text-lg font-bold text-gray-900">
                Decisiones de Arquitectura
              </h2>
              <button
                ref={closeRef}
                onClick={close}
                aria-label="Cerrar modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex overflow-x-auto border-b border-gray-200 px-6 gap-1 shrink-0">
              {SECTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className="whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors"
                  style={
                    activeTab === i
                      ? { borderColor: '#F15A2B', color: '#F15A2B' }
                      : { borderColor: 'transparent', color: '#6b7280' }
                  }
                  aria-selected={activeTab === i}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto p-6">
              {SECTIONS[activeTab].content}
            </div>
          </div>
        </>
      )}
    </>
  )
}

