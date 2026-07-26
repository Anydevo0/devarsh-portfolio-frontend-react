import { describe, expect, it } from 'vitest'

import { parseSseStream, type SseEvent } from '@/lib/sse'

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const queue = [...chunks]
  return new ReadableStream({
    pull(controller) {
      const chunk = queue.shift()
      if (chunk === undefined) {
        controller.close()
        return
      }
      controller.enqueue(encoder.encode(chunk))
    },
  })
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<SseEvent[]> {
  const events: SseEvent[] = []
  for await (const event of parseSseStream(stream)) {
    events.push(event)
  }
  return events
}

describe('parseSseStream', () => {
  it('parses event/data frames separated by a blank line', async () => {
    const stream = streamFromChunks([
      'event: token\ndata: {"content":"Hel"}\n\nevent: token\ndata: {"content":"lo"}\n\n',
    ])
    await expect(collect(stream)).resolves.toEqual([
      { event: 'token', data: '{"content":"Hel"}' },
      { event: 'token', data: '{"content":"lo"}' },
    ])
  })

  it('reassembles a frame whose blank-line terminator is split across two chunks', async () => {
    const stream = streamFromChunks([
      'event: token\ndata: {"content":"Hel"}\n',
      '\nevent: done\ndata: {"conversation_id":"abc"}\n\n',
    ])
    await expect(collect(stream)).resolves.toEqual([
      { event: 'token', data: '{"content":"Hel"}' },
      { event: 'done', data: '{"conversation_id":"abc"}' },
    ])
  })

  it('reassembles a frame split mid-line, not just at the terminator', async () => {
    const stream = streamFromChunks(['event: err', 'or\ndata: {"message":"boom"}\n\n'])
    await expect(collect(stream)).resolves.toEqual([{ event: 'error', data: '{"message":"boom"}' }])
  })
})
