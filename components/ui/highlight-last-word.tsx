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

export function highlightTrailingWords(
  text: string,
  count: number,
  className = "text-primary-text",
): ReactNode {
  const trimmed = text.trimEnd();
  const trailing = text.slice(trimmed.length);
  const words = trimmed.split(/\s+/);

  if (!trimmed || words.length <= count) {
    return <span className={className}>{trimmed}</span>;
  }

  const lead = words.slice(0, -count).join(" ");
  const highlight = words.slice(-count).join(" ");

  return (
    <>
      {lead}{" "}
      <span className={className}>{highlight}</span>
      {trailing}
    </>
  );
}
