/** Words per minute for technical prose — slower than the 250 used for fiction. */
const WORDS_PER_MINUTE = 200

/**
 * Estimated reading time for a Markdown body, in whole minutes (never zero).
 *
 * Only callable where the full post body is available — that is, the post page,
 * whose `BlogPostRead` includes `content`. The list endpoint deliberately omits the
 * body so a page of posts does not pull every article over the wire, which means
 * cards cannot show this without either guessing from the excerpt (a fabricated
 * number) or a new field on the list response. See README for that option.
 */
export function readingTimeMinutes(content: string): number {
  const words = content
    // Strip the syntax that is not read aloud: fences, inline code, link URLs, marks.
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
