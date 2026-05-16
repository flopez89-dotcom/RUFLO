# 🔗 MAPA DE CONEXIONES

> Relaciones entre dominios. Se actualiza automáticamente cada semana.

---

## Diagrama de Conexiones

```mermaid
graph TD
    HOME((🏠 HOME))

    E01[🍖 ELINOX]
    E02[🚀 PROYECTOS]
    E03[🎥 YOUTUBE]
    E04[👤 PERSONAL]
    E05[🛡️ SEGUROS]
    E06[🤖 LEONOR]
    E07[🚛 PT]
    E08[💬 PLATICAR]
    INBOX[📥 INBOX]

    HOME --> E01
    HOME --> E02
    HOME --> E03
    HOME --> E04
    HOME --> E05
    HOME --> E06
    HOME --> E07
    HOME --> E08
    HOME --> INBOX

    E01 -- equipos para trailers --> E07
    E01 -- contenido de productos --> E03
    E01 -- proyectos derivados --> E02
    E07 -- pólizas de flota --> E05
    E06 -- contexto de todo --> E01
    E06 -- contexto de todo --> E07
    E06 -- contexto de todo --> E04
    E02 -- contenido --> E03
```

---

## Conexiones Identificadas

| Dominio A | Dominio B | Tipo de conexión |
|-----------|-----------|-----------------|
| Elinox | PT | Equipos para food trailers |
| Elinox | YouTube | Contenido usando productos |
| Elinox | Proyectos | Proyectos que derivan del negocio |
| PT | Seguros | Pólizas de la flota |
| LEONOR | Todos | Contexto y memoria |

---

## Gaps Detectados por el Agente Semanal

<!-- El agente semanal llena esta sección automáticamente -->
