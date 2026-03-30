import type { Metadata } from 'next'
import { getArticles } from '@/lib/articles'
import ArticleCard from '@/components/ArticleCard'
import Pagination from '@/components/Pagination'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Artículos sobre mascotas',
  description:
    'Guías prácticas sobre cuidado, salud, adopción y bienestar de perros, gatos y otras mascotas. Escritas por veterinarios y especialistas.',
  alternates: {
    canonical: '/articulos',
  },
  openGraph: {
    title: 'Artículos sobre mascotas',
    description:
      'Guías prácticas sobre cuidado, salud, adopción y bienestar de perros, gatos y otras mascotas.',
    url: '/articulos',
    type: 'website',
  },
}

interface Props {
  searchParams: Promise<{ pagina?: string }>
}

export default async function ArticulosPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.pagina ?? '1', 10) || 1)
  const { articles, totalPages } = getArticles(page, 3)

  return (
    <main id="main-content" className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Artículos sobre mascotas
        </h1>
        <p className="mt-2 text-gray-600">
          Guías de cuidado, salud y bienestar para perros, gatos y más.
        </p>
      </header>

      <section aria-label="Listado de artículos">
        {articles.length === 0 ? (
          <p className="text-gray-500">No hay artículos en esta página.</p>
        ) : (
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
            {articles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ol>
        )}
      </section>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
        />
      )}
    </main>
  )
}
