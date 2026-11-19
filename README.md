# Trimmy

Trimmy removes extra spaces and line breaks from text when you copy it. It can also remove a symbol you choose, like the `$` in front of a terminal command.

Works with GNOME 46 to 51, which includes Ubuntu 24.04 LTS. Based on [Trimmer](https://github.com/hedgieinsocks/gnome-extension-trimmer).

## Install

Get it from [extensions.gnome.org](https://extensions.gnome.org/extension/8792/trimmy), then turn it on in the Extensions app.

To install a zip from [GitHub releases](https://github.com/n0tjohnny/gnome-extension-trimmy/releases) instead, run `gnome-extensions install --force trimmy@n0tjohnny.shell-extension.zip`, log out and back in, then turn it on. Don't unzip it by hand: the installer also prepares the settings.

## Use

Copy text with Ctrl+C. When you paste, the extra spaces are gone. When Trimmy changes a copy, only the plain text is kept, so formatting like bold or links is dropped.

| You copy | You paste |
|---|---|
| `"  hello  "` | `"hello"` |
| `"  $ ls  "` with `$` set as the trim string | `"ls"` |

## Settings

Open them from the Extensions app.

- Trim mode: clean both ends, only the start, or only the end.
- Trim string: extra text to remove from the ends, like `$`. Leave it empty to remove only spaces, tabs and line breaks.
- Try it: type a sample and see the result before you copy anything.

## Development

Run the tests with `gjs -m tests/trim.test.js` and `tests/e2e.sh` (needs GNOME Shell).
