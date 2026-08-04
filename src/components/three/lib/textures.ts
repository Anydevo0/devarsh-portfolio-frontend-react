import * as THREE from 'three'

/**
 * Every texture in the workstation scene is drawn at runtime onto a canvas — there
 * are no image assets to download, decode, or cache-bust. That keeps the 3D chunk's
 * asset payload at zero bytes and lets the resolution scale with the device tier.
 */

export type SceneQuality = 'high' | 'low'

/** Number of code rows per texture tile. Fixed so the texture wraps seamlessly when
 *  scrolled: every row is self-contained, so the last row meets the first cleanly. */
const CODE_ROWS = 50

/** Plausible service code, not lorem ipsum — this is what's actually on the monitor,
 *  so it should read as the subject's own work if a visitor zooms in. */
const EDITOR_SOURCE = [
  'from fastapi import APIRouter, Depends, HTTPException',
  'from sqlalchemy.ext.asyncio import AsyncSession',
  '',
  'from app.deps.db import get_session',
  'from app.schemas.chat import ChatRequest, ChatToken',
  'from app.services.chat_service import ChatService',
  '',
  'router = APIRouter(prefix="/chat", tags=["chat"])',
  '',
  '',
  '@router.post("", response_model=None)',
  'async def stream_chat(',
  '    payload: ChatRequest,',
  '    session: AsyncSession = Depends(get_session),',
  ') -> EventSourceResponse:',
  '    """Stream assistant tokens back over SSE."""',
  '    service = ChatService(session)',
  '    conversation = await service.resolve(payload.conversation_id)',
  '',
  '    if not await service.within_rate_limit(conversation):',
  '        raise HTTPException(429, "Too many requests.")',
  '',
  '    async def publish():',
  '        buffer = []',
  '        async for token in service.run(payload.message):',
  '            buffer.append(token)',
  '            yield ChatToken(content=token).sse()',
  '        await service.persist(conversation, "".join(buffer))',
  '        yield done_event(conversation.id)',
  '',
  '    return EventSourceResponse(publish())',
  '',
  '',
  'class RetrievalPipeline:',
  '    """Hybrid dense + lexical retrieval over the site corpus."""',
  '',
  '    def __init__(self, store: VectorStore, top_k: int = 8):',
  '        self.store = store',
  '        self.top_k = top_k',
  '',
  '    async def search(self, query: str) -> list[Document]:',
  '        embedding = await self.embedder.encode(query)',
  '        dense = await self.store.similar(embedding, k=self.top_k)',
  '        lexical = await self.store.bm25(query, k=self.top_k)',
  '        return rerank(dense + lexical)[: self.top_k]',
  '',
  '',
  '@task(retries=3, backoff=exponential)',
  'def reindex_corpus(batch_size: int = 256) -> None:',
  '    for chunk in iter_documents(batch_size):',
  '        vectors.upsert(chunk.id, embed(chunk.text))',
  '    logger.info("reindex.complete", extra={"count": vectors.size})',
]

/** Right-hand pane: a running service log, the other half of any real dev setup. */
const TERMINAL_SOURCE = [
  '$ uvicorn app.main:app --reload',
  'INFO     Started reloader process [48213]',
  'INFO     Started server process [48216]',
  'INFO     Application startup complete.',
  'INFO     Uvicorn running on http://0.0.0.0:8000',
  '',
  'INFO     POST /chat 200 142ms conv=8f21c4',
  'DEBUG    retrieval.hit k=8 score=0.881',
  'DEBUG    llm.stream tokens=214 ttft=310ms',
  'INFO     POST /chat 200 128ms conv=8f21c4',
  'INFO     GET  /projects 200 11ms',
  'INFO     GET  /blog?limit=10 200 9ms',
  'WARN     rate_limit.near threshold=0.82 ip=…c41d',
  'INFO     POST /contact 201 64ms',
  '',
  '$ pytest -q --cov=app',
  '........................................',
  '........................................',
  '164 passed in 6.28s',
  'coverage: 94.2% of statements',
  '',
  '$ docker compose up -d --build',
  ' ✔ Network portfolio_default    Created',
  ' ✔ Container portfolio-redis-1  Started',
  ' ✔ Container portfolio-db-1     Started',
  ' ✔ Container portfolio-api-1    Started',
  '',
  '$ celery -A app.worker inspect active',
  '-> celery@worker-1: OK',
  '   * reindex_corpus[3f9a] running 2.1s',
  '',
  '$ git log --oneline -4',
  '99f3043 Stream chat tokens over SSE',
  '39ea65f Add hybrid retrieval reranker',
  'dfad5a3 Cache embeddings in redis',
  '86ad963 Harden contact rate limiting',
  '',
  '$ curl -s localhost:8000/health | jq .status',
  '"ok"',
  '',
  '$ ▍',
]

const KEYWORDS = new Set([
  'from',
  'import',
  'async',
  'await',
  'def',
  'class',
  'return',
  'yield',
  'if',
  'not',
  'and',
  'or',
  'for',
  'in',
  'with',
  'as',
  'raise',
  'self',
  'None',
  'True',
  'False',
  'list',
  'str',
  'int',
  'dict',
])

const SYNTAX = {
  background: '#080b12',
  gutterText: '#2c344a',
  plain: '#c3cddf',
  keyword: '#8b5cf6',
  string: '#3ddc97',
  comment: '#3f4a60',
  decorator: '#5b7fff',
  number: '#e0a672',
  call: '#22d3ee',
} as const

/** Scans a line into coloured runs. Deliberately approximate — it only has to look
 *  right at ~12px on a surface the viewer sees in perspective, not compile. */
function tokenize(line: string): Array<{ text: string; color: string }> {
  const trimmed = line.trimStart()
  if (trimmed.startsWith('#')) return [{ text: line, color: SYNTAX.comment }]
  if (trimmed.startsWith('@')) return [{ text: line, color: SYNTAX.decorator }]

  const runs: Array<{ text: string; color: string }> = []
  const pattern = /("""[\s\S]*?"""|"[^"]*"|'[^']*')|(\b[A-Za-z_]\w*\b)|(\b\d+\.?\d*\b)|([^\w"']+)/g

  let match: RegExpExecArray | null
  while ((match = pattern.exec(line)) !== null) {
    const [text, str, word, num] = match
    if (str) {
      runs.push({ text, color: SYNTAX.string })
    } else if (word) {
      const isCall = line[pattern.lastIndex] === '('
      runs.push({
        text,
        color: KEYWORDS.has(word) ? SYNTAX.keyword : isCall ? SYNTAX.call : SYNTAX.plain,
      })
    } else if (num) {
      runs.push({ text, color: SYNTAX.number })
    } else {
      runs.push({ text, color: SYNTAX.plain })
    }
  }
  return runs
}

function logColor(line: string): string {
  if (line.startsWith('$')) return SYNTAX.call
  if (line.startsWith('WARN')) return SYNTAX.number
  if (line.startsWith('DEBUG')) return SYNTAX.comment
  if (line.startsWith('INFO')) return SYNTAX.plain
  if (line.startsWith(' ✔') || line.startsWith('->') || line.includes('passed')) {
    return SYNTAX.string
  }
  return SYNTAX.plain
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * The monitor's content: a split editor / terminal pane, drawn once. Motion comes
 * from scrolling `texture.offset.y` at render time — a uniform update rather than a
 * per-frame redraw, so an animated screen costs nothing on the CPU.
 */
export function createCodeTexture(quality: SceneQuality): THREE.CanvasTexture {
  // Matches the curved screen's ~2.5:1 arc so glyphs stay square.
  const width = quality === 'high' ? 2048 : 1024
  const height = quality === 'high' ? 800 : 400
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  const rowHeight = height / CODE_ROWS
  const fontSize = Math.round(rowHeight * 0.68)
  const splitX = Math.round(width * 0.6)
  const gutterWidth = Math.round(fontSize * 2.6)

  ctx.fillStyle = SYNTAX.background
  ctx.fillRect(0, 0, width, height)

  // Terminal pane sits a shade darker, with a hairline seam between the two.
  ctx.fillStyle = '#05070d'
  ctx.fillRect(splitX, 0, width - splitX, height)
  ctx.fillStyle = '#1b2334'
  ctx.fillRect(splitX, 0, 1, height)

  ctx.textBaseline = 'top'
  ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`
  const charWidth = ctx.measureText('M').width

  for (let row = 0; row < CODE_ROWS; row += 1) {
    const y = row * rowHeight + (rowHeight - fontSize) / 2
    const line = EDITOR_SOURCE[row % EDITOR_SOURCE.length] ?? ''

    ctx.fillStyle = SYNTAX.gutterText
    ctx.fillText(String(row + 1).padStart(3, ' '), fontSize * 0.5, y)

    let x = gutterWidth
    for (const run of tokenize(line)) {
      ctx.fillStyle = run.color
      ctx.fillText(run.text, x, y)
      x += run.text.length * charWidth
    }

    const logLine = TERMINAL_SOURCE[row % TERMINAL_SOURCE.length] ?? ''
    ctx.fillStyle = logColor(logLine)
    ctx.fillText(logLine, splitX + fontSize, y)
  }

  // The active line, so the editor reads as being worked in rather than parked.
  ctx.fillStyle = 'rgba(91, 127, 255, 0.09)'
  ctx.fillRect(0, 11 * rowHeight, splitX, rowHeight)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = quality === 'high' ? 8 : 2
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  return texture
}

/**
 * Soft radial falloff, used as an additive sprite to stand in for a bloom pass.
 * Real postprocessing would mean a second render target plus the ~40 KB
 * postprocessing dependency for one effect; a handful of additive sprites reads the
 * same at this scale and costs a few triangles.
 */
export function createGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.4)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Alpha mask for the chair's suspension back. An ergonomic task chair has a woven
 * mesh back rather than a solid panel — which is also what keeps the seated figure
 * visible through it from the camera's three-quarter angle.
 */
export function createMeshWeaveTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  const step = 8
  ctx.beginPath()
  for (let i = 0; i <= size; i += step) {
    ctx.moveTo(i, 0)
    ctx.lineTo(i, size)
    ctx.moveTo(0, i)
    ctx.lineTo(size, i)
  }
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 14)
  return texture
}
