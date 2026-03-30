import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/lib/articles'

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={article.image}
          alt={article.title}
          // fill hace que ocupe todo el contenedor — el padre tiene h-48 y position relative
          fill
          className="object-cover"
          // sin sizes el browser siempre descarga la imagen más grande,
          // aquí le decimos qué % del ancho ocupa según el breakpoint
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span
          className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: '#F15A2B' }}
        >
          {article.category}
        </span>
        <h2 className="mb-2 text-lg font-bold leading-snug text-gray-900">
          {article.title}
        </h2>
        <p className="mb-4 flex-1 text-sm text-gray-600 line-clamp-3">
          {article.description}
        </p>
        <div className="flex items-center justify-between">
          {/* dateTime va en ISO para que Google lo entienda, el texto visible lo formateamos bonito */}
          <time
            dateTime={article.date}
            className="text-xs text-gray-400"
          >
            {new Date(article.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <Link
            href={`/articulos/${article.slug}`}
            className="text-sm font-semibold transition-colors hover:underline"
            style={{ color: '#F15A2B' }}
            // sin esto el screen reader anunciaría "Leer artículo →" en todos los links
            // sin saber a cuál artículo corresponde cada uno
            aria-label={`Leer artículo: ${article.title}`}
          >
            Leer artículo →
          </Link>
        </div>
      </div>
    </article>
  )
}
