# Herramientas — MarkItDown (Microsoft)

Conversor universal a Markdown. Útil para procesar los documentos que entreguen
las áreas durante el relevamiento (PDFs, Excel, Word, PowerPoint, imágenes con
texto, etc.) y dejarlos en formato uniforme `.md` para consolidar después.

Repo oficial: <https://github.com/microsoft/markitdown>

---

## Para qué SÍ usarlo (formatos donde brilla)

| Formato | Caso típico en PANAMERICAN TRAILERS |
|---|---|
| **PDF** | Cotizaciones, documentos de aduana, certificados, manuales |
| **Excel (xlsx)** | Las planillas de Ventas, Producción, Compras, Finanzas |
| **Word (docx)** | Contratos, formatos de levantamiento, garantías |
| **PowerPoint (pptx)** | Presentaciones gerenciales o de capacitación |
| **Imágenes (PNG/JPG)** | Fotos de formatos en papel (extrae texto con OCR) |
| **HTML / web** | Páginas guardadas, correos exportados |
| **CSV / JSON / XML** | Exportaciones del ERP |
| **ZIP** | Carpetas comprimidas con varios formatos a la vez |

---

## Para qué NO conviene usarlo

- **Audio largo en español** (entrevistas grabadas): MarkItDown usa por debajo
  Google SpeechRecognition gratuito. La calidad para español de negocios y
  audios largos es mediocre.
  → Usar **Whisper de OpenAI** (también gratis y open source). Ver
  `whisper-uso.md` cuando lo añadamos.
- **PDFs escaneados de muy mala calidad**: hace OCR básico. Para escaneos
  difíciles, usar Adobe o Tesseract afinado.

---

## Cómo usarlo

### Opción A — en este entorno (ya instalado, para procesar archivos en la sesión)

```bash
# convertir un archivo a Markdown (sale por pantalla)
markitdown ruta/al/archivo.pdf

# guardar el Markdown en un archivo
markitdown ruta/al/archivo.xlsx -o salida.md

# convertir varios archivos de una carpeta
for f in carpeta/*.pdf; do
  markitdown "$f" -o "$(basename "$f" .pdf).md"
done
```

### Opción B — en tu computadora (para uso permanente)

Requiere Python 3.10+ instalado.

```bash
pip install 'markitdown[all]'
markitdown documento.pdf -o documento.md
```

En **Mac** (recomendado, vía Homebrew):
```bash
brew install python
pip install 'markitdown[all]'
```

En **Windows** (PowerShell):
```bash
py -m pip install 'markitdown[all]'
```

---

## Flujo recomendado para el relevamiento

1. Cuando una área te entregue documentos (Excel, PDF, plantillas, fotos de
   formatos en papel), guárdalos en una carpeta local por área.
2. Pásalos por MarkItDown → obtienes un `.md` por documento.
3. Subes solo los `.md` al repo, en `panamerican-trailers/documentos/[AREA]/`.
4. Yo (Claude) puedo leer todos esos `.md` rápido para incluirlos en el
   análisis consolidado.

> **Por qué `.md` y no el original:** los `.md` ocupan ~10x menos espacio que
> un PDF/Excel/Word, son legibles por humanos y por mí en segundos, y se ven
> bien en GitHub. Los originales puedes guardarlos en una carpeta local o
> Drive como respaldo.

---

## Para audio (entrevistas) — usar Whisper, NO MarkItDown

Ver flujo en `entrevistas/_README.md`. Resumen:
- WhatsApp transcribir (rápido, para audios cortos).
- TurboScribe.ai (web, 3 gratis/día, buena calidad).
- Whisper local (mejor calidad, instalable con `pip install openai-whisper`).
