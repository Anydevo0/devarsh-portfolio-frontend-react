/**
 * The hero's opening line.
 *
 * Set in Kalam — a face drawn by the Indian Type Foundry whose Latin is designed
 * alongside its Devanagari, so its calligraphic weight distribution comes from the
 * same tradition the greeting does. That is the reason for it; a generic script font
 * would have been decoration.
 *
 * Restraint is the point elsewhere in the palette, so the warm saffron used here is
 * the only place it appears in the interface. It is not a fourth accent — it is the
 * one human note, and it is tied to the one warm light in the 3D scene beside it.
 */
export function Greeting({ text, animate }: { text: string; animate: boolean }) {
  return (
    <p
      className={`glass-blur relative inline-flex items-center gap-2.5 rounded-full py-2 pr-5 pl-4 ${
        animate ? 'animate-float-soft' : ''
      }`}
    >
      {/* A soft bloom behind the pill rather than a text-shadow on the glyphs, which
          at this weight would thicken the strokes and cost legibility. */}
      <span
        aria-hidden="true"
        className="bg-saffron/20 absolute inset-0 -z-10 rounded-full blur-xl"
      />
      <span className="font-script text-saffron text-xl leading-none">{text}</span>
    </p>
  )
}
