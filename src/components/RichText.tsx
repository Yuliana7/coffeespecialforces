import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/** Renders Lexical editor content, or nothing when the field is empty. */
export const RichText = ({
  data,
  className = '',
}: {
  data?: unknown
  className?: string
}) => {
  if (!data) return null

  return (
    <div className={`prose-body max-w-3xl ${className}`}>
      <LexicalRichText data={data as SerializedEditorState} />
    </div>
  )
}
