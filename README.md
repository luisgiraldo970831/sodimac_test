# Patitas – Prueba Técnica Frontend

Sitio editorial sobre cuidado y bienestar de mascotas, construido como prueba técnica con **Next.js 16 (App Router)**, **React 19**, **TypeScript** y **Tailwind CSS v4**. Cada decisión de implementación tiene el SEO como criterio central.

---

## Cómo correr el proyecto

### Requisitos

- Node.js 18 o superior
- npm 9 o superior

### Desarrollo local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd sodimac_test

# 2. Instalar dependencias
npm install

# 3. Servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). La raíz `/` redirige automáticamente a `/articulos`.

### Build de producción

```bash
npm run build   # compila y valida TypeScript
npm start       # sirve el build de producción en :3000
```

### Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Redirect 307 a `/articulos` |
| `/articulos` | Listado paginado (3 artículos por página) |
| `/articulos?pagina=2` | Segunda página del listado |
| `/articulos/[slug]` | Detalle de artículo — ej: `/articulos/guia-cuidado-perros` |
| `/articulos/slug-inexistente` | Página 404 personalizada, HTTP 404 real |
| `/robots.txt` | Directivas para crawlers, generado dinámicamente |
| `/sitemap.xml` | 9 URLs indexables, generado dinámicamente |

### Valor agregado: modal de arquitectura

Al entrar por primera vez aparece un modal con las decisiones técnicas del proyecto organizadas en 5 pestañas: stack, estrategia de rendering, estructura de archivos, decisiones SEO y guía de navegación. Se puede reabrir en cualquier momento con el botón **ⓘ** en la esquina inferior derecha.

---

## Decisiones técnicas tomadas

### Estructura del proyecto

```
data/
  articles.json              → 8 artículos mock sobre mascotas
lib/
  articles.ts                → getArticles(), getArticleBySlug(), getAllSlugs()
components/
  Header.tsx                 → Navbar con skip-link de accesibilidad (Server Component)
  ArticleCard.tsx            → Tarjeta con next/image optimizado (Server Component)
  Pagination.tsx             → Links <a> crawleables por Google (Server Component)
  JsonLd.tsx                 → Inyecta JSON-LD en <head> vía dangerouslySetInnerHTML
  ArchModal.tsx              → Modal de arquitectura con localStorage (Client Component)
app/
  layout.tsx                 → Metadata global, title.template, Header + ArchModal
  page.tsx                   → redirect('/articulos') — evita contenido duplicado
  not-found.tsx              → 404 personalizado (Next.js agrega noindex automático)
  robots.ts                  → Genera /robots.txt con MetadataRoute.Robots
  sitemap.ts                 → Genera /sitemap.xml con todos los slugs
  articulos/
    page.tsx                 → Listado SSR con paginación por query param
    [slug]/
      page.tsx               → Detalle SSR con generateMetadata y JSON-LD
```

### Stack y justificación

| Librería | Versión | Por qué |
|----------|---------|---------|
| Next.js | 16.2.1 | App Router, SSR nativo, `generateMetadata` API, `MetadataRoute` para robots y sitemap |
| React | 19.2.4 | Server Components por defecto — solo `ArchModal` es Client Component |
| TypeScript | 5 | Interfaces `Article` y `PaginatedResult` previenen errores en tiempo de compilación |
| Tailwind CSS | 4 | Utility-first, sin CSS muerto en producción, `@plugin` para tipografía |
| @tailwindcss/typography | 0.5 | Estilos base para el HTML de los artículos (h2, p, strong, etc.) |

### Capa de datos

Se usó un archivo JSON local (`data/articles.json`) en lugar de una API externa para que:
- El proyecto funcione sin dependencias externas ni variables de entorno.
- La función `getArticleBySlug(slug)` sea idéntica a como sería con un ORM o una llamada `fetch` — quien consuma la función no sabe ni le importa de dónde vienen los datos.
- El único cambio para conectar una base de datos real sería el cuerpo de esas funciones en `lib/articles.ts`.

### Paginación

Se usa query parameter `?pagina=N` (en lugar de rutas tipo `/articulos/pagina/2`) porque:
- Google indexa cada página con su URL propia.
- `rel=prev/next` fue deprecado por Google en 2019, no se incluye.
- La URL canónica del listado sin parámetro es `/articulos`, y se declara en `alternates.canonical`.

### Server Components vs. Client Components

Todos los componentes son Server Components salvo `ArchModal`, que necesita `useState`, `useEffect` y acceso a `localStorage`. Mantener el árbol de componentes en servidor al máximo reduce el JavaScript enviado al browser y mejora el LCP.

---

## Estrategia de rendering (SSR)

Ambas páginas de contenido usan **SSR real** forzado en cada request:

```ts
export const dynamic = 'force-dynamic'
```

### Por qué SSR y no SSG

Con datos estáticos como estos, SSG sería más eficiente en producción real. Se eligió SSR explícito porque:

1. El enunciado lo pide específicamente.
2. Demuestra que el HTML llega completo al crawler sin depender de JavaScript.
3. El patrón escala sin cambios si los datos pasan a venir de una base de datos o CMS.

### Flujo de un request

```
Browser → Next.js Server
  ├── getArticleBySlug(slug)      leer datos (servidor)
  ├── generateMetadata()          construir <head> completo (servidor)  
  └── ArticuloDetallePage()       generar HTML con React (servidor)
        → Response: HTML + CSS    sin JS requerido para ver el contenido
```

Googlebot recibe el `<title>`, `<meta description>`, `<h1>`, el texto del artículo y el JSON-LD todos en la primera respuesta HTTP, sin necesidad de ejecutar JavaScript.

### SSR vs. SSG vs. ISR — comparativa rápida

| Estrategia | Cuándo usar | Trade-off |
|------------|-------------|-----------|
| **SSR** (`force-dynamic`) | Datos que cambian con cada request | Más lento que SSG, siempre fresco |
| **SSG** (por defecto en App Router) | Contenido que no cambia | Build más lento, deploys para actualizar |
| **ISR** (`revalidate: N`) | Contenido que cambia pero puede tener stale | Complejidad de caché, buen balance |

---

## Por qué robots.ts y la API de Metadata de Next.js

### El problema que resuelve

La forma tradicional de tener un `robots.txt` es colocar un archivo estático en `public/robots.txt`. Funciona, pero tiene dos limitaciones:

1. **No conoce el entorno** — si tienes entornos de staging o preview, no puedes evitar que sean indexados sin mantener archivos distintos por entorno.
2. **No está tipado** — es texto plano, es fácil escribir mal una directiva y no saberlo hasta que un crawler la ignora.

Next.js 16 introduce `MetadataRoute.Robots`, una interfaz TypeScript que genera el archivo en tiempo de render. El resultado en `/robots.txt` es idéntico al archivo estático, pero el origen es código verificado por el compilador:

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://patitas.vercel.app/sitemap.xml',
  }
}
```

Lo mismo aplica para `app/sitemap.ts` — en lugar de mantener un XML a mano, Next.js genera el documento desde el array de objetos que devuelve la función, siempre sincronizado con las rutas reales del sitio.

### La API de Metadata de Next.js

Next.js centraliza toda la metadata de la aplicación en dos lugares:

**1. El root layout — metadata base y template de título**

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://patitas.vercel.app'),
  title: {
    default: 'Patitas',
    template: '%s | Patitas',   // todas las páginas hijas heredan este sufijo
  },
  description: 'Guías de cuidado, salud y bienestar para mascotas...',
  robots: { index: true, follow: true },
  openGraph: { siteName: 'Patitas', locale: 'es_ES', type: 'website' },
}
```

`metadataBase` es necesario para que Next.js construya las URLs absolutas de OpenGraph e imágenes. Sin él, las URLs quedarían como `/articulos/imagen.jpg` en lugar de `https://patitas.vercel.app/articulos/imagen.jpg`, que es lo que necesita el crawler de redes sociales.

**2. `generateMetadata` por página — metadata dinámica**

Cada página de detalle sobrescribe los valores del layout con los datos del artículo específico. Next.js hace un merge automático: lo que no declare la página lo hereda del layout padre.

```ts
// app/articulos/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(await params.slug)
  return {
    title: article.title,          // se inserta en el template: "Guía perros | Patitas"
    description: article.description,
    alternates: { canonical: `/articulos/${article.slug}` },
    openGraph: {
      type: 'article',
      publishedTime: article.date,
      images: [{ url: article.image, width: 800, height: 450, alt: article.title }],
    },
  }
}
```

**Por qué `generateMetadata` en servidor y no un `<Head>` en el cliente**

En Next.js App Router ya no existe el componente `<Head>` de Pages Router. La razón es importante: si el `<title>` se inyectara desde un Client Component, el HTML inicial que recibe el crawler llegaría sin ese tag — lo agregaría JavaScript en el browser después de montar el componente. `generateMetadata` resuelve esto porque se ejecuta en el servidor antes de generar el HTML, garantizando que el `<head>` completo viaja en la primera respuesta HTTP.

---

## Consideraciones SEO

### 1. Metadata dinámica por página

Cada artículo genera su propio `<title>` y `<meta description>` en servidor:

```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(await params.slug)
  return {
    title: article.title,          // renderiza como "Título | Patitas"
    description: article.description,
    alternates: { canonical: `/articulos/${article.slug}` },
    openGraph: {
      type: 'article',
      publishedTime: article.date,
      images: [{ url: article.image, alt: article.title }],
    },
  }
}
```

El `title.template = '%s | Patitas'` del root layout agrega el sufijo de marca en todas las páginas automáticamente.

### 2. URLs semánticas

Las rutas usan slugs descriptivos con palabras clave del contenido:
- ✅ `/articulos/guia-cuidado-perros`
- ❌ `/articulos/1` o `/articulos?id=1`

### 3. HTML semántico

- Un único `<h1>` por página.
- `<h2>` para las secciones dentro del artículo.
- Etiquetas semánticas correctas: `<article>`, `<main>`, `<header>`, `<nav>`, `<footer>`, `<time dateTime="...">`.
- Breadcrumb con `<nav aria-label="Ruta de navegación">` y `<ol>` en la página de detalle.

### 4. Datos estructurados JSON-LD

La página de detalle inyecta un schema `Article` de schema.org que habilita rich results en Google:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Título del artículo",
  "description": "Descripción del artículo",
  "datePublished": "2026-01-10",
  "author": { "@type": "Person", "name": "Dra. Valentina Soto" },
  "image": "https://picsum.photos/seed/dogs-care/800/450",
  "publisher": { "@type": "Organization", "name": "Patitas" }
}
```

### 5. Imágenes optimizadas con next/image

- Genera `srcset` automático con múltiples tamaños según el viewport.
- Lazy loading por defecto en imágenes fuera del fold.
- `priority` en la imagen principal del artículo para optimizar el LCP.
- `alt` descriptivo en todas las imágenes.

### 6. Manejo de 404 correcto

- `notFound()` en el servidor devuelve **HTTP 404 real** — un `return null` devolvería 200 y Google indexaría la página vacía como contenido válido (soft 404).
- Next.js inyecta `<meta name="robots" content="noindex">` en las páginas 404 automáticamente.

### 7. robots.txt

Generado dinámicamente en `app/robots.ts` con la API `MetadataRoute.Robots` de Next.js. El resultado es:

```
User-agent: *
Allow: /
Sitemap: https://patitas.vercel.app/sitemap.xml
```

### 8. sitemap.xml

Generado en `app/sitemap.ts` usando `getAllSlugs()` para incluir todas las URLs del sitio:

- `/articulos` — `priority: 1.0`, `changeFrequency: weekly`
- `/articulos/[slug]` × 8 — `priority: 0.8`, `changeFrequency: monthly`

### 9. OpenGraph

Todas las páginas de detalle incluyen metadata OpenGraph completa para que las vistas previas al compartir en redes sociales sean ricas: imagen, título, descripción, fecha de publicación y autor.

### 10. Accesibilidad como señal SEO

- Skip-link (`<a href="#main-content">`) para usuarios de teclado, visible al recibir foco.
- `aria-label` en todos los `<nav>` para diferenciarlos.
- `aria-current="page"` en el número de página activo de la paginación.
- `aria-label` descriptivo en cada link de artículo para que lectores de pantalla anuncien el título, no solo "Leer artículo".
- `role="dialog"` + `aria-modal="true"` + manejo de foco en el modal de arquitectura.

