import remarkGfm from 'remark-gfm'

// Deliberately no rehype-raw here — react-markdown without it never renders raw HTML
// embedded in the Markdown source (it's treated as plain text), which is the actual
// security control, not a policy statement. Never add rehype-raw to this array.
export const MARKDOWN_REMARK_PLUGINS = [remarkGfm]
