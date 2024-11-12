import { JSONContent } from "@tiptap/react";

export function convertMarkdownToTiptap(markdown: string): JSONContent {
  const doc: JSONContent = {
    type: "doc",
    content: [],
  };

  const lines = markdown.split("\n");
  let currentList: JSONContent | null = null;
  let currentListType: "bulletList" | "orderedList" | null = null;

  for (const line of lines) {
    if (!line.trim()) {
      // Add empty paragraph for blank lines
      doc.content?.push({
        type: "paragraph",
        content: [],
      });
      continue;
    }

    // Handle headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      doc.content?.push({
        type: "heading",
        attrs: { level },
        content: [{ type: "text", text: headingMatch[2] }],
      });
      continue;
    }

    // Handle bullet lists
    const bulletMatch = line.match(/^\*\s+(.+)$/);
    if (bulletMatch) {
      if (currentListType !== "bulletList") {
        currentList = {
          type: "bulletList",
          content: [],
        };
        doc.content?.push(currentList);
        currentListType = "bulletList";
      }

      currentList?.content?.push({
        type: "listItem",
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: bulletMatch[1] }],
        }],
      });
      continue;
    }

    // Handle numbered lists
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (currentListType !== "orderedList") {
        currentList = {
          type: "orderedList",
          content: [],
        };
        doc.content?.push(currentList);
        currentListType = "orderedList";
      }

      currentList?.content?.push({
        type: "listItem",
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: numberedMatch[1] }],
        }],
      });
      continue;
    }

    // Handle blockquotes
    const quoteMatch = line.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      doc.content?.push({
        type: "blockquote",
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: quoteMatch[1] }],
        }],
      });
      continue;
    }

    // Reset list context if we're not in a list item
    if (!bulletMatch && !numberedMatch) {
      currentList = null;
      currentListType = null;
    }

    // Handle regular paragraphs
    doc.content?.push({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    });
  }

  return doc;
}