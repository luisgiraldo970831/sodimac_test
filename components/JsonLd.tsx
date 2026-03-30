export function JsonLd({ data }: { data: object }) {
  return (
    <script
      // este type es el que Google busca para leer datos estructurados,
      // sin él simplemente ignora el script
      type="application/ld+json"
      // React escapa el HTML por defecto, lo que rompería el JSON.
      // dangerouslySetInnerHTML lo inyecta tal cual — está bien acá
      // porque el contenido sale de nuestro JSON, no de input del usuario.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
