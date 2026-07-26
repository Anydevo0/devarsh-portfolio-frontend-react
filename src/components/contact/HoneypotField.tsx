interface HoneypotFieldProps {
  value: string
  onChange: (value: string) => void
}

/**
 * A honeypot only a bot fills in. Off-screen absolute positioning — deliberately
 * NOT `display:none`/`visibility:hidden`/`opacity:0`, the specific computed-style
 * properties unsophisticated bots probe for and skip to look human; this still
 * renders/paints (just outside the viewport), so a bot that blindly fills every
 * visible-looking input still populates it. `tabIndex={-1}` removes it from
 * keyboard tab order; `aria-hidden` removes it from the accessibility tree, so
 * screen-reader users never encounter it during a normal traversal either.
 */
export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div className="absolute top-0 -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor="nickname">Leave this field blank</label>
      <input
        id="nickname"
        name="nickname"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
