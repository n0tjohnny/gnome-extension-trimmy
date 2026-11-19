# Trimmy

Trimmy cleans up text right after you copy it, so what you paste has no stray whitespace or unwanted prefix/suffix.

## Language

**Copy**:
Text placed on the clipboard with Ctrl+C or a Copy menu item. Trimmy acts on every copy; copied files are left alone.
_Avoid_: selection, primary selection (text that is only highlighted is never trimmed)

**Trim mode**:
Which ends of a copy get cleaned: both ends, start only, or end only.
_Avoid_: left, right, side

**Trim string**:
Optional text removed once from each cleaned end of a copy, after surrounding whitespace is removed. Spaces around the trim string itself do not count.
_Avoid_: custom string, prefix, suffix, pattern

**Result**:
What Trimmy puts back on the clipboard after cleaning a copy. It can be empty.
_Avoid_: output, trimmed text
