import {
  workflow, node, trigger, splitInBatches, nextBatch, newCredential, expr
} from '@n8n/workflow-sdk';

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres LEONOR, el cerebro digital de Francisco López (Pancho).
Francisco es dueño de Elinox (cocinas y muebles de acero inoxidable) y Averno (asadores premium)
en Guadalupe, Nuevo León, México. También es socio de Panamerican Trailers (Nashville y San Antonio).

Tu tarea es procesar raw input del inbox y convertirlo en una nota estructurada de conocimiento.

## Dominios disponibles
- Elinox → proyectos, clientes, producción, cotizaciones de Elinox/Averno
- Averno → asadores, contenido, dealers, costeador
- Finanzas → CxC, CxP, reportes, flujo de caja
- Clientes-VIP → relaciones clave (SMP/Alejandro Gutiérrez, Hospital Muguerza, etc.)
- Decisiones → log de decisiones importantes tomadas
- Historial-AI → conversaciones relevantes con IA que vale la pena conservar
- Memoria-Diaria → log de actividad del día, reuniones, llamadas
- Skills → instrucciones y configuraciones de agentes

## Tu output SIEMPRE debe ser JSON con esta estructura exacta:
{
  "dominio": "Elinox",
  "titulo": "Nombre descriptivo de la nota",
  "fecha": "YYYY-MM-DD",
  "tags": ["tag1", "tag2"],
  "conexiones": ["Nota relacionada 1", "Nota relacionada 2"],
  "contenido_markdown": "# Título\\n\\n## Resumen\\n...\\n\\n## Detalles\\n...\\n\\n## Siguiente paso\\n- [ ] ...",
  "prioridad": "alta",
  "tipo": "tarea"
}

## Reglas
1. Extrae SOLO lo importante, elimina relleno
2. El contenido_markdown siempre tiene un Siguiente paso con al menos 1 acción concreta
3. Si el input menciona dinero, ponlo en números concretos
4. Máximo 300 palabras en contenido_markdown
5. Si no puedes determinar el dominio con certeza, usa Memoria-Diaria
6. Responde SOLO con el JSON, sin texto adicional, sin markdown code blocks`;

// ── DECODE CODE ───────────────────────────────────────────────────────────────
const DECODE_CODE = `
let rawText = '';
try {
  const buf = await this.helpers.getBinaryDataBuffer($input.item, 'data');
  rawText = buf.toString('utf8');
} catch(e) {
  const bin = $input.item.binary?.data;
  if (bin) rawText = Buffer.from(bin.data, 'base64').toString('utf8');
}
const fileId = $input.item.json.id || '';
const fileName = $input.item.json.name || '';
return { json: { rawText, fileId, fileName } };
`;

// ── PARSE + ROUTE CODE ────────────────────────────────────────────────────────
const PARSE_CODE = `
const folderMap = {
  'Elinox':        '16oDJ8hJrSK3ldB7KaaRCSjVjqLxf_Rzj',
  'Averno':        '1jM18N2nj_LX2RnYGXyQJn7hY-y6-kOV6',
  'Finanzas':      '1zf083QuysxDmzU82a_9pzdfj-t86__gl',
  'Clientes-VIP':  '1E1VuME2m4d6mvmwxSaNMk3tEP6dNeYqI',
  'Decisiones':    '1BZZ8E0Gl6eMK9qylthE8TRFbPHyYSCff',
  'Historial-AI':  '15f7IhdNAwIgeZlbGQU4gcBu60gN6kSmK',
  'Memoria-Diaria':'13aglRYSE2Wer4Tc4gAqbQfaf7r9JI-ze',
  'Skills':        '1iJbaUqvCSjx4PkdYWrGksj01gEOL_KPw',
};

const claudeText = $input.item.json.text || '';
const fileId = $('Decodificar Contenido').item.json.fileId;

let parsed;
try {
  const clean = claudeText.replace(/\`\`\`json\\n?/g, '').replace(/\`\`\`/g, '').trim();
  parsed = JSON.parse(clean);
} catch(e) {
  const match = claudeText.match(/\\{[\\s\\S]*\\}/);
  try { parsed = match ? JSON.parse(match[0]) : null; } catch(e2) { parsed = null; }
  if (!parsed) parsed = {
    dominio: 'Memoria-Diaria',
    titulo: 'Input sin estructura — ' + new Date().toISOString().split('T')[0],
    fecha: new Date().toISOString().split('T')[0],
    tags: ['inbox', 'sin-parsear'],
    conexiones: [],
    contenido_markdown: '# Raw Input\\n\\n' + claudeText.substring(0, 500),
    prioridad: 'baja',
    tipo: 'referencia'
  };
}

const folderId = folderMap[parsed.dominio] || folderMap['Memoria-Diaria'];
const date = parsed.fecha || new Date().toISOString().split('T')[0];
const titulo = (parsed.titulo || 'Sin título').replace(/[\\/\\\\:*?"<>|]/g, '-');
const fileName = date + ' — ' + titulo + '.md';

const conexiones = (parsed.conexiones || []).map(c => '[[' + c + ']]').join(', ');
const fullContent = [
  '---',
  'dominio: ' + parsed.dominio,
  'fecha: ' + date,
  'tags: [' + (parsed.tags || []).join(', ') + ']',
  'prioridad: ' + (parsed.prioridad || 'media'),
  'tipo: ' + (parsed.tipo || 'referencia'),
  '---',
  '',
  parsed.contenido_markdown || '',
  conexiones ? '\\n## Conexiones\\n' + conexiones : ''
].join('\\n');

return { json: { folderId, fileName, fileContent: fullContent, originalFileId: fileId, dominio: parsed.dominio } };
`;

// ── NODES ─────────────────────────────────────────────────────────────────────

const scheduleTrigger = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  config: {
    name: 'Diario 8am',
    parameters: {
      rule: {
        interval: [{ field: 'days', daysInterval: 1, triggerAtHour: 8, triggerAtMinute: 0 }]
      }
    },
    position: [240, 300]
  },
  output: [{}]
});

const searchInbox = node({
  type: 'n8n-nodes-base.googleDrive',
  version: 3,
  credentials: { googleDriveOAuth2Api: newCredential('Google Drive OAuth2') },
  config: {
    name: 'Buscar Inbox',
    parameters: {
      resource: 'fileFolder',
      operation: 'search',
      returnAll: true,
      filter: {
        folderId: { __rl: true, mode: 'id', value: '1Rg3AS0cO8VRZ7I8E2j5SNqmGCEVPrYBU' },
        whatToSearch: 'files'
      }
    },
    position: [540, 300]
  },
  output: [{ id: 'file-id', name: 'file.md' }]
});

const loopFiles = splitInBatches({
  version: 3,
  config: {
    name: 'Loop Inbox',
    parameters: { batchSize: 1 },
    position: [840, 300]
  }
});

const downloadFile = node({
  type: 'n8n-nodes-base.googleDrive',
  version: 3,
  credentials: { googleDriveOAuth2Api: newCredential('Google Drive OAuth2') },
  config: {
    name: 'Descargar Archivo',
    parameters: {
      resource: 'file',
      operation: 'download',
      fileId: { __rl: true, mode: 'id', value: expr('={{ $json.id }}') }
    },
    position: [1140, 180]
  },
  output: [{ id: 'file-id', name: 'file.md' }]
});

const decodeContent = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Decodificar Contenido',
    parameters: { mode: 'runOnceForEachItem', language: 'javaScript', jsCode: DECODE_CODE },
    position: [1440, 180]
  },
  output: [{ rawText: 'texto', fileId: 'id', fileName: 'file.md' }]
});

const processWithClaude = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  credentials: { anthropicApi: newCredential('Anthropic API') },
  config: {
    name: 'Procesar con Claude',
    parameters: {
      resource: 'text',
      operation: 'message',
      modelId: { __rl: true, mode: 'id', value: 'claude-sonnet-4-6' },
      messages: { values: [{ role: 'user', content: expr('={{ $json.rawText }}') }] },
      options: { system: SYSTEM_PROMPT, maxTokens: 2048, temperature: 0.3 }
    },
    position: [1740, 180]
  },
  output: [{ text: '{"dominio":"Elinox"}' }]
});

const parseAndRoute = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parsear y Rutear',
    parameters: { mode: 'runOnceForEachItem', language: 'javaScript', jsCode: PARSE_CODE },
    position: [2040, 180]
  },
  output: [{ folderId: 'id', fileName: 'note.md', fileContent: '# Note', originalFileId: 'id', dominio: 'Elinox' }]
});

const createNote = node({
  type: 'n8n-nodes-base.googleDrive',
  version: 3,
  credentials: { googleDriveOAuth2Api: newCredential('Google Drive OAuth2') },
  config: {
    name: 'Crear Nota en Vault',
    parameters: {
      resource: 'file',
      operation: 'createFromText',
      content: expr('={{ $json.fileContent }}'),
      name: expr('={{ $json.fileName }}'),
      folderId: { __rl: true, mode: 'id', value: expr('={{ $json.folderId }}') }
    },
    position: [2340, 180]
  },
  output: [{ id: 'new-file-id' }]
});

const deleteFromInbox = node({
  type: 'n8n-nodes-base.googleDrive',
  version: 3,
  credentials: { googleDriveOAuth2Api: newCredential('Google Drive OAuth2') },
  config: {
    name: 'Limpiar Inbox',
    parameters: {
      resource: 'file',
      operation: 'deleteFile',
      fileId: { __rl: true, mode: 'id', value: expr("={{ $('Parsear y Rutear').item.json.originalFileId }}") }
    },
    position: [2640, 180]
  },
  output: [{ id: 'deleted-id', success: true }]
});

const inboxVacio = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Inbox Vacío',
    parameters: { mode: 'raw', jsonOutput: '{"status":"inbox vacío, nada que procesar"}' },
    position: [1140, 440]
  },
  output: [{ status: 'inbox vacío, nada que procesar' }]
});

// ── WORKFLOW ──────────────────────────────────────────────────────────────────

export default workflow('leonor-agente-diario', 'LEONOR — Agente Diario')
  .add(scheduleTrigger)
  .to(searchInbox)
  .to(loopFiles
    .onDone(inboxVacio)
    .onEachBatch(
      downloadFile
        .to(decodeContent)
        .to(processWithClaude)
        .to(parseAndRoute)
        .to(createNote)
        .to(deleteFromInbox)
        .to(nextBatch(loopFiles))
    )
  );
