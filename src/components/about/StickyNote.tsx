import type { NotebookNote } from '@/types/siteContent'

/**
 * Rest rotation per note, in the order they're written — the brief's own values.
 * Never perfectly aligned, which is what sells four sheets of paper rather than one
 * card component repeated four times.
 */
const ROTATIONS = ['-rotate-3', 'rotate-1', '-rotate-1', 'rotate-2'] as const

/**
 * Paper tones, one per note. Real sticky-note colours (the saturated yellow/pink/
 * green three-pack) would be the loudest thing on the page; these are the same idea
 * bent through the site's own palette — warm parchment for saffron's family, then a
 * sage, a dusty blue tied to the accent `--color-pulse`, and a soft rose — all light
 * enough to read as paper against the page's near-black background, none of them
 * bright enough to compete with it.
 */
const TONES = [
  { paper: 'bg-[#e9ddc7]', tape: 'bg-[#f4efe1]/80' },
  { paper: 'bg-[#d9e4dc]', tape: 'bg-[#eef3ee]/80' },
  { paper: 'bg-[#dbe1ee]', tape: 'bg-[#eef1f8]/80' },
  { paper: 'bg-[#ecdce1]', tape: 'bg-[#f7eef1]/80' },
] as const

/** Tape rotates against the note's own tilt, so it reads as holding the sheet down
 *  rather than as another decoration tilted the same way as everything else. */
const TAPE_ROTATIONS = ['rotate-6', '-rotate-3', 'rotate-3', '-rotate-6'] as const

interface StickyNoteProps {
  note: NotebookNote
  /** Position in the row — selects this note's rotation and paper tone. */
  index: number
}

/**
 * Indexes with wraparound. `noUncheckedIndexedAccess` can't see that the modulo
 * always lands in range, so it types every computed index as possibly `undefined` —
 * true in general, not true of these four fixed-length style tuples cycling against
 * an array of four notes. One assertion here beats one at each of the three call sites.
 */
function cycle<T>(items: readonly T[], index: number): T {
  return items[index % items.length] as T
}

/**
 * One sheet of paper pinned to the notebook spread, holding a handful of short lines
 * rather than the paragraph-plus-tag-list a normal card would carry — the format
 * reads as a real note precisely because it doesn't try to be a whole design system.
 *
 * Ink is dark-on-light, the one place on the page it is: these are meant to read as
 * paper sitting on a dark desk, not as another glass panel in the site's own palette,
 * and that contrast is what makes them look pinned to it rather than part of it.
 */
export function StickyNote({ note, index }: StickyNoteProps) {
  const tone = cycle(TONES, index)
  const rotation = cycle(ROTATIONS, index)
  const tapeRotation = cycle(TAPE_ROTATIONS, index)

  return (
    <div
      className={`group relative h-full ${rotation} transition-transform duration-[350ms] ease-out hover:z-10 hover:-translate-y-2 hover:rotate-0`}
    >
      {/* The tape holding it down — a strip of translucent paper, not a design token,
          so it reads as a physical piece stuck on top rather than a UI accent. */}
      <span
        aria-hidden="true"
        className={`absolute -top-3.5 left-1/2 h-7 w-16 -translate-x-1/2 ${tapeRotation} ${tone.tape} shadow-[0_2px_6px_rgba(0,0,0,0.25)]`}
      />

      <article
        className={`relative flex h-full flex-col rounded-lg p-6 text-[#241f19] shadow-[0_16px_32px_-14px_rgba(0,0,0,0.55)] transition-shadow duration-[350ms] ease-out group-hover:shadow-[0_28px_48px_-16px_rgba(0,0,0,0.6)] ${tone.paper}`}
      >
        <h3 className="font-script text-xl font-bold tracking-tight text-[#1c1712]">
          {note.title}
        </h3>
        <ul className="font-script mt-4 flex-1 space-y-2 text-[0.95rem] leading-6 text-[#3a3226]">
          {note.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-[#8a7a5c]">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}
