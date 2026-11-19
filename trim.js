// The trim rule. Shared by extension.js and prefs.js so the "Try it" preview
// always matches what a copy really gets.

// mode: 0 = both ends, 1 = start only, 2 = end only (the trim-mode setting)
export function trim(text, mode, trimString = "") {
  const atStart = mode !== 2;
  const atEnd = mode !== 1;
  const stripWhitespace = s => {
    if (atStart)
      s = s.trimStart();
    if (atEnd)
      s = s.trimEnd();
    return s;
  };

  let result = stripWhitespace(text);
  const cut = trimString.trim();
  if (cut) {
    if (atStart && result.startsWith(cut))
      result = result.slice(cut.length);
    if (atEnd && result.endsWith(cut))
      result = result.slice(0, -cut.length);
    result = stripWhitespace(result);
  }
  return result;
}
