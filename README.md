# Trimmy

Trimmy removes extra spaces and line breaks from text when you copy it. It can also remove a symbol you choose, like the `$` in front of a terminal command.

Works with GNOME 49+ versions. Based on [Trimmer](https://github.com/hedgieinsocks/gnome-extension-trimmer).

## Install

Get it from [extensions.gnome.org]([https://extensions.gnome.org](https://extensions.gnome.org/extension/8792/trimmy/)), then turn it on in the Extensions app.

## Use

Copy text with Ctrl+C. When you paste, the extra spaces are gone.

| You copy | You paste |
|---|---|
| `"  hello  "` | `"hello"` |
| `"  $ ls  "` with `$` set as the trim string | `"ls"` |

## Settings

Open them from the Extensions app.

- Trim mode: clean both ends, only the start, or only the end.
- Trim string: extra text to remove from the ends, like `$`. Leave it empty to remove only spaces.
- Try it: type a sample and see the result before you copy anything.

## Development

Run the tests with `gjs -m tests/trim.test.js` and `tests/e2e.sh` (needs GNOME Shell).
