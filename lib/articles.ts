// exportamos la interfaz para que los componentes no dependan del JSON directamente
import articlesData from '@/data/articles.json'

export interface Article {
  id: number
  title: string
  slug: string
  description: string
  content: string
  image: string
  date: string
  author: string
  category: string
}

export interface PaginatedResult {
  articles: Article[]
  total: number
  totalPages: number
  page: number
}

// TypeScript infiere el JSON con tipos muy estrictos (literales), por eso necesita el cast.
// La forma del JSON coincide con la interfaz, así que es seguro.
const articles: Article[] = articlesData as Article[]

export function getArticles(page: number = 1, pageSize: number = 3): PaginatedResult {
  const total = articles.length
  const totalPages = Math.ceil(total / pageSize)
  // alguien podría poner ?pagina=0 o ?pagina=9999 en la URL, esto lo contiene
  const safePage = Math.max(1, Math.min(page, totalPages))
  const start = (safePage - 1) * pageSize
  const end = start + pageSize

  return {
    articles: articles.slice(start, end),
    total,
    totalPages,
    page: safePage,
  }
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug)
}

