import {ExtensionPreferences} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import {trim} from "./trim.js";

// Order matches the trim-mode setting: 0, 1, 2
const trimModes = ["Both ends", "Start only", "End only"];

export default class TrimmerPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const page = new Adw.PreferencesPage();

    const options = new Adw.PreferencesGroup({
      title: "Trimming",
      description:
        "Every time you copy text (Ctrl+C or Copy), Trimmy removes spaces, tabs " +
        "and line breaks from its ends. Text you only highlight is not changed. " +
        "Changes apply right away.",
    });
    page.add(options);

    const modeRow = new Adw.ComboRow({
      title: "Trim mode",
      subtitle: "Which ends of the copied text to clean",
      model: Gtk.StringList.new(trimModes),
    });
    settings.bind("trim-mode", modeRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    options.add(modeRow);

    const extra = new Adw.PreferencesGroup({
      title: "Trim string",
      description:
        "Optional text removed once from each cleaned end, after the whitespace. " +
        "With \"$\", copying \"  $ ls  \" gives \"ls\". " +
        "If nothing is left, the clipboard becomes empty.",
    });
    page.add(extra);

    const stringRow = new Adw.EntryRow({title: "Text to remove"});
    settings.bind("trim-string", stringRow, "text", Gio.SettingsBindFlags.DEFAULT);
    extra.add(stringRow);

    const tryIt = new Adw.PreferencesGroup({
      title: "Try it",
      description: "Type or paste a sample to see what Trimmy puts on the clipboard with the options above.",
    });
    page.add(tryIt);

    const sampleRow = new Adw.EntryRow({title: "Sample", text: "  $ ls  "});
    tryIt.add(sampleRow);

    // use_markup off: the sample is user text and may contain < or &
    const resultRow = new Adw.ActionRow({title: "Result", use_markup: false});
    tryIt.add(resultRow);

    const updateResult = () => {
      const result = trim(
        sampleRow.text,
        settings.get_int("trim-mode"),
        settings.get_string("trim-string"),
      );
      resultRow.subtitle = result ? `"${result}"` : "(empty: the clipboard is cleared)";
    };
    sampleRow.connect("changed", updateResult);
    const settingsId = settings.connect("changed", updateResult);
    window.connect("close-request", () => settings.disconnect(settingsId));
    updateResult();

    window.add(page);
    // tall enough that the Try it result shows without scrolling
    window.set_default_size(560, 780);
  }
}
