/**
 * Minimal builder for Lexical's serialized shape, used by the seed script so
 * rich-text fields arrive with real content instead of empty editors.
 */
const textNode = (text: string) => ({
  type: "text",
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text,
  version: 1,
});

const paragraph = (text: string) => ({
  type: "paragraph",
  children: [textNode(text)],
  direction: "ltr" as const,
  format: "" as const,
  indent: 0,
  textFormat: 0,
  version: 1,
});

export const richTextFrom = (paragraphs: string[]) => ({
  root: {
    type: "root",
    children: paragraphs.map(paragraph),
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
  },
});
