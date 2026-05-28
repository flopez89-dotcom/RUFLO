# Entrevistas — Flujo de trabajo

Carpeta donde se guarda **una entrevista por archivo**, ya estructurada y
sintetizada. La transcripción cruda no se guarda aquí (se descarta tras
generar el MD estructurado).

---

## Cómo procesar una nueva entrevista

### 1. Transcribir el audio (gratis, desde el celular o web)
- **WhatsApp** → enviarte la nota a ti mismo → mantener presionada → "Transcribir".
- **iPhone** → app Notas (dictado) o *Voice Memos* con transcripción.
- **Android** → Google Recorder / Live Transcribe.
- **Web (mejor calidad)** → [TurboScribe.ai](https://turboscribe.ai) (3 gratis/día),
  o MacWhisper en Mac.

### 2. Limpieza rápida (2 min)
- Quitar muletillas obvias, saludos, partes off-topic.
- No es necesario que quede perfecto — solo legible.

### 3. Enviarla a Claude en UN solo mensaje
Indicar al inicio:
- Área entrevistada
- Nombre y cargo del entrevistado
- Fecha
- Si es necesario, número de preguntas del cuestionario que cubrieron

Luego pegar la transcripción (o subir como `.txt` al repo y avisarme la ruta).

### 4. Claude genera el archivo estructurado
Se guardará como:
`entrevistas/AAAA-MM-DD_AREA_nombre.md`

Ejemplos:
- `entrevistas/2026-05-28_VENTAS_juan-perez.md`
- `entrevistas/2026-05-30_PRODUCCION_maria-lopez.md`

Estructura: ver `_plantilla-entrevista.md`.

### 5. Descartar la transcripción cruda
El MD estructurado ya tiene todo lo accionable. La transcripción cruda
ocupa mucho espacio y no aporta más valor.

---

## Reglas para mantener el repo liviano

1. **Una entrevista por sesión de chat** — no pegar 5 transcripciones juntas.
2. **No subir el audio** al repo (queda en tu celular o en una carpeta local).
3. **No subir la transcripción cruda** al repo — solo el MD estructurado.
4. **Si hay que volver al detalle** de algo específico, mejor escuchar de
   nuevo el fragmento del audio que reprocesar toda la transcripción.

---

## Qué pasa cuando ya tenemos todas las entrevistas

Cuando los 7–9 archivos estén en esta carpeta, Claude los lee de una sola
vez y produce:

- **v2 del mapa de flujo** (`01-mapa-flujo-informacion.md` corregido con
  la realidad relevada).
- **Matriz de handoffs llena** (sección 14 de la guía de relevamiento).
- **Inventario de sistemas consolidado** (sección 12).
- **Lista priorizada de automatizaciones** quick-wins → estratégicas.

Ese es el entregable final del relevamiento.
