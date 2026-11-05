import type { ReactNode } from "react";

export function highlightLastWord(
  text: string,
  className = "text-primary-text",
): ReactNode {
  const match = text.match(/^([\s\S]*?)([^\s?!.,;:]+)([?!.,;:]*)(\s*)$/);
  if (!match) return text;

  const [, lead, word, punctuation, trailing] = match;

  return (
    <>
      {lead}
      <span className={className}>{word}</span>
      {punctuation}
      {trailing}
    </>
  );
}
