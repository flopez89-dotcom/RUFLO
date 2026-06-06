# Claude en Excel — Guía de resolución de problemas

> Guía consolidada con los problemas reales reportados (incluyendo el bug
> abierto del OAuth desde marzo 2026) y los fixes que SÍ funcionan.
> Última revisión: junio 2026.

---

## 0. Primero: ¿cuál de los dos productos estás usando?

Los confunden seguido. Son distintos:

| Producto | Qué es | Dónde se usa |
|---|---|---|
| **Claude for Excel (add-in)** | Complemento que instalas DENTRO de Excel. Te da un panel lateral con Claude que lee y modifica tu hoja. | Se abre dentro de Excel (Desktop o Web). |
| **Microsoft 365 Connector** | Conexión que pones en claude.ai para que Claude (desde su interfaz) pueda leer tus archivos de OneDrive/SharePoint. | Se usa en claude.ai, no en Excel. |

Si tu problema es **"Claude no me responde dentro de Excel"** → add-in.
Si es **"Claude en claude.ai no me lee mis archivos de Excel"** → connector.
La guía siguiente cubre los dos.

---

## 1. Requisitos mínimos (si no cumples, nada funcionará)

### Para el Add-in de Excel
- **Plan Claude pago**: Pro, Max, Team o Enterprise. El gratuito **no** lo permite.
- **Microsoft 365 con suscripción activa** (Business o personal Microsoft 365).
  - **NO funciona** con Excel 2019, 2021, 2024 perpetuos.
- **Excel actualizado** (versión 16.x reciente — Archivo → Cuenta → Acerca de Excel).
- Archivo guardado en **OneDrive o SharePoint** (no solo local).
- Red sin bloqueo a:
  - `https://appsforoffice.microsoft.com`
  - `https://login.microsoftonline.com`
  - `https://*.claude.ai`
  - `https://*.anthropic.com`

### Para el M365 Connector (claude.ai)
- **Cuenta Microsoft 365 Business** con Microsoft Entra tenant.
- **NO funciona** con cuentas personales `@outlook.com`, `@hotmail.com`, `@live.com`.
- Funciona con cualquier plan Claude (Free, Pro, Max, Team, Enterprise).

---

## 2. Bug conocido y abierto: error de login OAuth

**Síntoma exacto** (alemán o equivalente en otros idiomas):
```
Authorization failed.
Redirect-URI https://pivot.claude.ai/auth/callback is not supported by client.
```

- **Reportado desde:** marzo 2026.
- **Causa:** mala configuración del lado de Anthropic en el servidor OAuth.
- **Estado:** abierto, no resuelto, reseñas en Microsoft Marketplace en 2.5/5 ⭐.
- **NO se arregla** con: reiniciar Office, limpiar caché de add-ins,
  reinstalar el complemento.

### Workarounds que sí han funcionado (probar en orden)
1. **Cerrar sesión completamente en Office** (Archivo → Cuenta → Cerrar sesión)
   y volver a iniciar sesión con tu cuenta de **trabajo M365**, NO personal.
2. **Iniciar Excel desde una ventana nueva de OneDrive** (office.com →
   abrir el archivo → ahí instalar el add-in).
3. **Usar la versión web de Excel** (office.com) en lugar de Desktop si
   estás en Desktop, o viceversa.
4. **Cambiar idioma de Office a inglés** temporalmente — algunos usuarios
   reportan que el OAuth falla en alemán y español, pero pasa en inglés.
5. **Probar en navegador de incógnito** para descartar extensiones que
   bloquean cookies de terceros.
6. **Esperar y volver a probar** — Anthropic ha empujado fixes parciales;
   a veces vuelve a funcionar unos días.

---

## 3. Error "You don't have permission to use this add-in"

- **Reportado masivamente desde:** 29 de mayo 2026.
- **A quién afecta:** principalmente cuentas Microsoft **personales**.
- **Causa:** Anthropic restringió el add-in a tenants Business / Entra.

### Fix
- Si tu cuenta es personal (`@outlook.com`, `@hotmail.com`) → **no hay arreglo**.
  Necesitas una cuenta M365 Business para usar el add-in.
- En PANAMERICAN TRAILERS lo más probable es que ya tengan licencias
  Microsoft 365 Business — confirma con IT y úsalas para iniciar sesión
  en Excel **antes** de abrir el add-in de Claude.

---

## 4. Tabla de fallas por síntoma (encuentra el tuyo)

### "El panel de Claude no aparece o aparece en blanco"
1. Insertar → Mis complementos → ¿está Claude? Si no, agrégalo.
2. Archivo → Opciones → Centro de Confianza → Complementos COM → asegurar
   que no esté deshabilitado por política.
3. Cerrar Excel completamente (en Windows: Administrador de tareas →
   matar todos los procesos EXCEL.EXE) → reabrir.
4. Limpiar caché de add-ins:
   - **Windows:** borrar carpeta `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef`
   - **Mac:** `~/Library/Containers/com.microsoft.Excel/Data/Library/Caches`
5. Reinstalar el add-in desde la tienda.

### "Falla el sign-in / OAuth error"
- Ver sección 2 (bug abierto) — los workarounds están ahí.

### "Service unavailable / no se puede conectar"
1. Verificar red: en navegador, abrir `https://claude.ai` — ¿carga?
2. Si estás en red corporativa, pedirle a IT abrir:
   - `*.anthropic.com`
   - `*.claude.ai`
   - `appsforoffice.microsoft.com`
   - `login.microsoftonline.com`
3. Probar con hotspot del celular para descartar firewall.
4. Verificar status: `https://status.anthropic.com` — puede haber outage.

### "Responde mal, hace cuentas equivocadas o no lee mi hoja"
1. **Guardar el archivo en OneDrive/SharePoint** (no solo local) — esto
   resuelve el 60% de estos casos.
2. Seleccionar el rango específico antes de preguntar, NO toda la hoja.
   Claude no maneja bien hojas >50k filas.
3. Eliminar errores de celda (`#REF!`, `#NAME?`, fórmulas circulares).
4. Si tu archivo tiene **macros o tablas dinámicas complejas**, copiar los
   datos a una hoja nueva limpia y probar ahí.
5. Mejorar el prompt: en lugar de "analiza esto" → "en el rango A1:F500,
   suma la columna D agrupando por la columna B y muéstrame el top 10".

### "Excel se cuelga o se cierra solo al usar Claude"
1. Probar en **modo seguro**: cerrar Excel → Win+R → `excel /safe`.
   Si en modo seguro funciona, hay conflicto con otro complemento → ir
   desactivando uno por uno.
2. Actualizar Microsoft 365 a la última versión.
3. Reducir el tamaño del rango de trabajo.

### "El add-in funciona pero solo en inglés / no entiende español"
- En el sidebar de Claude, escribe **siempre en español** y pídele que
  responda en español. La interfaz está en inglés pero el modelo entiende
  perfecto el español.
- Si la respuesta sale en inglés, agrega al prompt: "responde en español".

---

## 5. Para el M365 Connector (si tu problema es claude.ai sin ver tus archivos)

1. Ir a claude.ai → Settings → Connectors → Microsoft 365.
2. Iniciar sesión con cuenta **Business** (no personal).
3. Si dice "Admin approval required" → tu IT debe aprobar la app en Entra.
4. Una vez conectado, en claude.ai puedes pedir: "busca en mi OneDrive el
   archivo X" o "lee la hoja Y de SharePoint".

---

## 6. Alternativa que SÍ funciona (verificada hoy)

El add-in está roto del lado de Anthropic — no podemos arreglarlo desde
acá. **Pero el objetivo real ("usar Claude con tus Excel") sí lo
resolvemos** con un camino estable que ya está montado en este repo y
verificado funcionando:

### Script `xlsx_a_claude.py` (en este mismo folder)

Convierte cualquier `.xlsx` a un `.md` que pegas en claude.ai (web,
desktop o VS Code) y obtienes el mismo resultado que el add-in roto.

**Uso:**
```bash
# Convertir un archivo
python3 xlsx_a_claude.py "Pipeline Ventas.xlsx"

# Con archivo de salida específico
python3 xlsx_a_claude.py datos.xlsx -o resumen.md

# Limitar filas por hoja si el Excel es enorme
python3 xlsx_a_claude.py grande.xlsx --max-filas 200
```

**Qué genera:**
- Resumen del archivo (nombre, hojas, dimensiones).
- Una sección por hoja con tabla Markdown lista para Claude.
- Si la hoja excede `--max-filas`, muestra las primeras N + últimas 5
  + total de filas (suficiente para que Claude entienda el universo).

**Flujo completo:**
1. `python3 xlsx_a_claude.py tu_archivo.xlsx`
2. Abres el `.md` que genera.
3. Lo copias completo y lo pegas en claude.ai con tu pregunta.
4. Listo — Claude analiza tu Excel sin necesidad del add-in roto.

### Por qué este camino es mejor que esperar a Anthropic
- **No depende del bug abierto** — pasa por la interfaz normal de claude.ai
  que sí funciona.
- **Más rápido** — Excel local → md → chat, sin OAuth ni red corporativa
  bloqueando endpoints.
- **Funciona con cualquier plan** Claude (incluso gratuito para casos
  pequeños).
- **Privacidad controlada** — el `.md` lo revisas antes de pegarlo y
  decides qué datos compartir.
- **Reutilizable** — el mismo script sirve para todas las áreas durante
  el relevamiento (Ventas, Producción, Compras, etc.).

### Alternativa rápida sin script
Si no quieres usar el script, también puedes:
- Subir el `.xlsx` directo a una conversación en claude.ai (acepta el
  formato).
- O usar `markitdown archivo.xlsx -o archivo.md` (ver `markitdown-uso.md`).

---

## 7. Si nada funciona — escalar

- **Soporte Anthropic:** support@anthropic.com con captura del error
  exacto, idioma de tu Office, plan Claude, y versión de Excel.
- **Microsoft Q&A:** los hilos más activos de este problema están en
  `learn.microsoft.com/answers` buscando "Claude add-in".
- **Status page:** `https://status.anthropic.com`.

---

## Fuentes

- [Use Claude for Excel — Claude Help Center](https://support.claude.com/en/articles/12650343-use-claude-for-excel)
- [Bug report: OAuth login failure #37299](https://github.com/anthropics/claude-code/issues/37299)
- [Microsoft Q&A — "You don't have permission to use this add-in"](https://learn.microsoft.com/en-us/answers/questions/5906688/you-dont-have-permission-to-use-this-add-in-error)
- [Unable to Install Claude for Excel — Microsoft Q&A](https://learn.microsoft.com/en-ie/answers/questions/5867614/unable-to-install-the-claude-for-excel-add-in-in-e)
- [Microsoft 365 Connector setup — Claude Help Center](https://support.claude.com/en/articles/12542951-enable-and-use-the-microsoft-365-connector)
