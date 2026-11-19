# Trimmy

Trimmy is a GNOME Shell extension that cleans up text right after you copy it. It removes spaces, tabs and line breaks from the ends of the copied text, and can also remove a piece of text you choose, such as the `$` prompt in front of a shell command.

It works with GNOME 49, 50 and 51. Trimmy is a fork of [Trimmer](https://github.com/hedgieinsocks/gnome-extension-trimmer) by hedgieinsocks.

## How to use it

Turn Trimmy on in the Extensions app, then copy text as usual with Ctrl+C or a Copy menu item. When you paste, the text is already cleaned. Text you only highlight (the middle-click selection) is not changed.

To change how Trimmy cleans text, open its preferences from the Extensions app, or run:

```
gnome-extensions prefs trimmy@n0tjohnny
```

Changes apply right away. The Try it section at the bottom of the preferences window shows what Trimmy would put on the clipboard for any sample you type or paste.

## Options

Trim mode chooses which ends of the copied text get cleaned.

| Trim mode | You copy | You paste |
|---|---|---|
| Both ends (default) | `"  hello  "` | `"hello"` |
| Start only | `"  hello  "` | `"hello  "` |
| End only | `"  hello  "` | `"  hello"` |

Trim string is optional text that Trimmy also removes from each cleaned end. Trimmy first removes the whitespace, then removes the trim string once, then removes any whitespace that is left. Spaces you type around the trim string itself are ignored.

| Trim string | Trim mode | You copy | You paste |
|---|---|---|---|
| `$` | Both ends | `"  $ ls  "` | `"ls"` |
| `$` | Start only | `"$$ls"` | `"$ls"` (removed once) |
| `$` | Both ends | `"$"` | `""` (clipboard is cleared) |

If cleaning leaves nothing, for example when you copy only spaces, Trimmy clears the clipboard.

## Install

From [extensions.gnome.org](https://extensions.gnome.org), or from this repository:

```
gnome-extensions pack --extra-source=trim.js --extra-source=icon.png --extra-source=README.md
gnome-extensions install --force trimmy@n0tjohnny.shell-extension.zip
```

Log out and back in, then turn Trimmy on in the Extensions app.

## Tests

`gjs -m tests/trim.test.js` checks the trim rule in `trim.js`.

`tests/e2e.sh` starts a separate headless GNOME Shell with its own settings, loads Trimmy from this repository and copies sample text through the real clipboard. It also checks that a GNOME version missing from `metadata.json` keeps Trimmy from loading. Your own session is not touched.

The words used for Trimmy's concepts are defined in [GLOSSARY.md](GLOSSARY.md).
