import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getAllSlugs } from '@/lib/articles'
import { JsonLd } from '@/components/JsonLd'

// fuerza SSR en cada request — sin esto Next.js cachea la página en build time
export const dynamic = 'force-dynamic'

interface Props {
  // en Next.js 16 params ya es una Promise, hay que hacer await antes de usarlo
  // (era síncrono en versiones anteriores — breaking change)
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return { title: 'Artículo no encontrado' }
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `/articulos/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `/articulos/${article.slug}`,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: article.image, width: 800, height: 450, alt: article.title }],
    },
  }
}

// declara los slugs conocidos para prefetching, no genera páginas estáticas
// (force-dynamic lo impide). sin esto Next.js no sabe qué rutas existen de antemano
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export default async function ArticuloDetallePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  // notFound() devuelve HTTP 404 real — un return null daría 200 y Google
  // indexaría la página vacía como si fuera contenido válido
  if (!article) {
    notFound()
  }

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Patitas',
      url: 'https://patitas.vercel.app',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://patitas.vercel.app/articulos/${article.slug}`,
    },
  }

  return (
    <>
      <JsonLd data={jsonLdData} />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-gray-500">
          <ol className="flex items-center gap-1 list-none p-0">
            <li>
              <Link href="/articulos" className="hover:underline" style={{ color: '#F15A2B' }}>
                Artículos
              </Link>
            </li>
            {/* aria-hidden para que el lector de pantalla no lea el "›" decorativo */}
          <li aria-hidden="true" className="select-none">›</li>
            <li className="text-gray-700 truncate max-w-xs">{article.title}</li>
          </ol>
        </nav>

        <article>
          <header className="mb-8">
            <div className="mb-3">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: '#F15A2B' }}
              >
                {article.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{article.author}</span>
              <time dateTime={article.date}>
                {new Date(article.date).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </header>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>

          {/* el content del artículo es HTML (<h2>, <p>, etc.) — si lo renderizamos
              como {article.content} React lo escaparía y se vería como texto plano.
              está bien usar dangerouslySetInnerHTML porque el HTML viene de nuestro
              JSON, no de input del usuario */}
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        <footer className="mt-12 pt-6 border-t border-gray-200">
          <Link
            href="/articulos"
            className="text-sm font-medium hover:underline"
            style={{ color: '#F15A2B' }}
          >
            ← Volver a artículos
          </Link>
        </footer>
      </main>
    </>
  )
}
