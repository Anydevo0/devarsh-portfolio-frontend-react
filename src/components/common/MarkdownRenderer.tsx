import ReactMarkdown from 'react-markdown'

import { MARKDOWN_REMARK_PLUGINS } from '@/lib/markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * The one Markdown rendering path for the whole app — blog posts, project
 * descriptions, and the admin's live preview all import this. No `rehype-raw`, no
 * `dangerouslySetInnerHTML`: this is a hard security requirement, not a style choice.
 */
export function MarkdownRenderer({ content, className = 'prose' }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={MARKDOWN_REMARK_PLUGINS}>{content}</ReactMarkdown>
    </div>
  )
}
